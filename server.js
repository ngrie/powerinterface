import fs from 'fs'
import YAML from 'yaml'
import axios from 'axios'
import express from 'express'
import morgan from 'morgan'

import paramConverter from './src/paramConverter.js'
import paramDefinition from './src/paramDefinition.js'
import {
  isMaintenanceChargeEndedEvent,
  isMaintenanceChargeStartedEvent,
  isWinterModeEndedEvent,
  isWinterModeStartedEvent,
  parseEvent,
} from './src/eventParser.js'
import { initStats, updateStats } from './src/inMemoryStats.js'
import buildWebinterface from './src/webinterface.js'
import { logUnknownRequest, runUpdateCheck, handleSigInt } from './src/utils.js'
import CURRENT_VERSION from './currentVersion.js'

import InfluxDbAction from './src/actions/InfluxDbAction.js'
import PushoverAction from './src/actions/PushoverAction.js'

const actionClasses = {
  influxdb: InfluxDbAction,
  pushover: PushoverAction,
}
const actions = []

handleSigInt()

let config = {}
let forwardRequests = false
let logRequests = false
let webReload = 60

if (fs.existsSync('./config.yml')) {
  config = YAML.parse(fs.readFileSync('./config.yml', 'utf8')) || {}
  if (!Object.keys(config).length) {
    console.log('Empty or invalid config.yml found, ignoring')
  } else if (config.actions && Array.isArray(config.actions)) {
    config.actions.forEach(({ type, ...actionConfig }) => {
      if (!actionClasses[type]) {
        console.warn(`Invalid action "${type}" found in config.yml, ignoring`)
        return
      }

      const actionInstance = new actionClasses[type](actionConfig)
      actionInstance.boot({ paramDefinition })
      actions.push(actionInstance)
      console.log(`Action registered: ${type}`)
    })
  }

  if (config.forwardRequests) {
    forwardRequests = true
  }
  if (config.logRequests) {
    logRequests = true
  }
  if ('webReload' in config) {
    webReload = parseInt(config.webReload)
  }
}

const app = express()
const port = 80

app.use(express.json())
app.use(morgan('combined'))

let updateAvailable = false
let powerRouters = new Map()

runUpdateCheck(CURRENT_VERSION, () => updateAvailable = true)

app.get('/', (req, res) => {
  let powerRouterId = req.query.powerRouterId
  if (powerRouters.has(powerRouterId)) {
    let powerRouter = powerRouters.get(powerRouterId)
    let isWinterMode = powerRouter.isWinterMode
    let isMaintenanceCharge = powerRouter.isMaintenanceCharge
    res.send(buildWebinterface(powerRouterId, powerRouters.keys(), powerRouter.currentData, powerRouter.stats, {
      isWinterMode,
      isMaintenanceCharge
    }, {webReload}, powerRouter.lastUpdate, updateAvailable))
  } else if (powerRouters.size > 0 && powerRouterId === undefined) {
    let powerRouterId = powerRouters.keys().next().value
    let powerRouter = powerRouters.get(powerRouterId)
    let isWinterMode = powerRouter.isWinterMode
    let isMaintenanceCharge = powerRouter.isMaintenanceCharge
    res.send(buildWebinterface(powerRouterId, powerRouters.keys(), powerRouter.currentData, powerRouter.stats, {
      isWinterMode,
      isMaintenanceCharge
    }, {webReload}, powerRouter.lastUpdate, updateAvailable))
  } else {
    res.send(buildWebinterface(null, null, {}, initStats(), {
      isWinterMode:false,
      isMaintenanceCharge:false
    }, {webReload}, null, updateAvailable))
  }
})

app.get('/values.json', (req, res) => {
  let powerRouterId = req.query.powerRouterId
  if (powerRouters.has(powerRouterId)) {
    res.type('json').send(powerRouters.get(powerRouterId).currentData)
  } else {
    res.type('json').send({})
  }
})

app.get('/status.json', (req, res) => {
  let powerRouterId = req.query.powerRouterId
  if (powerRouters.has(powerRouterId)) {
    res.type('json').send(powerRouters.get(powerRouterId).currentStatuses)
  } else {
    res.type('json').send({})
  }
})

app.get('/events.json', (req, res) => {
  let powerRouterId = req.query.powerRouterId
  if (powerRouters.has(powerRouterId)) {
    res.type('json').send([...powerRouters.get(powerRouterId).events].reverse())
  } else {
    res.type('json').send([])
  }
})

app.post('/logs.json', (req, res) => {
  try {
    const { data, statuses } = paramConverter(req.body, paramDefinition)
    const powerRouterId = req.body.header.powerrouter_id
    if (!powerRouters.has(powerRouterId)) {
      let powerRouter = {}
      powerRouter.powerRouterId = powerRouterId
      powerRouter.events = []
      powerRouters.set(powerRouterId, powerRouter)
    }
    let powerRouter = powerRouters.get(powerRouterId)
    powerRouter.stats = initStats()
    powerRouter.currentData = data
    powerRouter.currentStatuses = statuses
    powerRouter.lastUpdate = new Date()
    updateStats(data, powerRouter.stats)
    if (logRequests) {
      logUnknownRequest(req)
    }

    actions.forEach((action, index) => {
      try {
        action.update({ data, powerRouterId })
      } catch (e) {
        console.error(`Failed to invoke action at index ${index}`, e)
      }
    })
    if (forwardRequests) {
      // forward request to logging1.powerrouter.com
      axios.post('http://77.222.80.91/logs.json', req.body, { headers: { Host: 'logging1.powerrouter.com' } })
        .catch(({ response }) => {
          console.error('Forwarding request to logging1.powerrouter.com failed', response && response.status)
        })
    }
  } catch (e) {
    console.error(e)
    if (logRequests) {
      logUnknownRequest(req, e)
    }
  }
  res.type('json').status(201).send({ 'next-log-level': 2, status: 'ok' })
})

app.post('/events.json', (req, res) => {
  try {
    const event = parseEvent(req.body.event)
    let isWinterMode = false
    let isMaintenanceCharge = false
    if (isWinterModeStartedEvent(event)) isWinterMode = true
    if (isWinterModeEndedEvent(event)) isWinterMode = false
    if (isMaintenanceChargeStartedEvent(event)) isMaintenanceCharge = true
    if (isMaintenanceChargeEndedEvent(event)) isMaintenanceCharge = false

    const powerRouterId = req.body.header.powerrouter_id
    if (!powerRouters.has(powerRouterId)) {
      let powerRouter = {}
      powerRouter.powerRouterId = powerRouterId
      powerRouter.events = []
      powerRouters.set(powerRouterId, powerRouter)
    }
    let powerRouter = powerRouters.get(powerRouterId)
    powerRouter.isWinterMode = isWinterMode
    powerRouter.isMaintenanceCharge = isMaintenanceCharge

    powerRouter.events.push(event)
    if (powerRouter.events.length > 300) {
      powerRouter.events.shift()
    }
  } catch (e) {
    console.error(e)
  }
  if (logRequests) {
    logUnknownRequest(req)
  }
  if (forwardRequests) {
    // forward request to logging1.powerrouter.com
    axios.post('http://77.222.80.91/events.json', req.body, { headers: { Host: 'logging1.powerrouter.com' } })
      .catch(({ response }) => {
        console.error('Forwarding request to logging1.powerrouter.com failed', response && response.status)
      })
  }
  res.type('json').status(201).send({ 'next-log-level': 2, status: 'ok' })
})

app.route('*').all((req, res) => {
  if (logRequests) {
    logUnknownRequest(req)
  }
  res.sendStatus(404)
})

app.listen(port, () => {
  console.log('Power interface started')
})
