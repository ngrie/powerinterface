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

handleSigInt()

let config = {}
let influxAction = null
let forwardRequests = false
if (fs.existsSync('./config.yml')) {
  config = YAML.parse(fs.readFileSync('./config.yml', 'utf8')) || {}
  if (config.actions && Array.isArray(config.actions) && config.actions.length === 1 && config.actions[0].type === 'influxdb') {
    const { type, ...influxConfig } = config.actions[0]
    influxAction = new InfluxDbAction(influxConfig)
    influxAction.boot({ paramDefinition })
    console.log('Influx action registered')
  } else {
    console.warn('Invalid config.yml found, ignoring')
  }

  if (config.forwardRequests) {
    forwardRequests = true
  }
}

const app = express()
const port = 80

app.use(express.json())
app.use(morgan('combined'))

let updateAvailable = false
let currentData = {}
let currentStatuses = {}
let events = []
let isWinterMode = false
let isMaintenanceCharge = false
let lastUpdate = null
let stats = initStats()

runUpdateCheck(CURRENT_VERSION, () => updateAvailable = true)

app.get('/', (req, res) => {
  res.send(buildWebinterface(currentData, stats, { isWinterMode, isMaintenanceCharge }, lastUpdate, updateAvailable))
})

app.get('/values.json', (req, res) => {
  res.type('json').send(currentData)
})

app.get('/status.json', (req, res) => {
  res.type('json').send(currentStatuses)
})

app.get('/events.json', (req, res) => {
  res.type('json').send(events.reverse())
})

app.post('/logs.json', (req, res) => {
  try {
    const { data, statuses, unknownRequest } = paramConverter(req.body, paramDefinition)
    currentData = data
    currentStatuses = statuses
    lastUpdate = new Date()
    updateStats(data, stats)
    if (unknownRequest) {
      logUnknownRequest(req)
    }
    if (influxAction) {
      influxAction.update({ data })
    }
    if (forwardRequests) {
      // forward request to logging1.powerrouter.com
      axios.post('http://77.222.80.91/logs.json', req.body, { headers: { Host: 'logging1.powerrouter.com' } })
    }
  } catch (e) {
    console.error(e)
    logUnknownRequest(req, e)
  }
  res.type('json').status(201).send({ 'next-log-level': 2, status: 'ok' })
})

app.post('/events.json', (req, res) => {
  try {
    const event = parseEvent(req.body.event)
    if (isWinterModeStartedEvent(event)) isWinterMode = true
    if (isWinterModeEndedEvent(event)) isWinterMode = false
    if (isMaintenanceChargeStartedEvent(event)) isMaintenanceCharge = true
    if (isMaintenanceChargeEndedEvent(event)) isMaintenanceCharge = false

    events.push(event)
    if (events.length > 100) {
      events.shift()
    }
  } catch (e) {
    console.error(e)
  }
  logUnknownRequest(req)
  if (forwardRequests) {
    // forward request to logging1.powerrouter.com
    axios.post('http://77.222.80.91/events.json', req.body, { headers: { Host: 'logging1.powerrouter.com' } })
  }
  res.type('json').status(201).send({ 'next-log-level': 2, status: 'ok' })
})

app.route('*').all((req, res) => {
  logUnknownRequest(req)
  res.sendStatus(404)
})

app.listen(port, () => {
  console.log('Power interface started')
})
