import fs from 'fs'
import YAML from 'yaml'
import express from 'express'
import morgan from 'morgan'

import paramConverter from './src/paramConverter.js'
import paramDefinition from './src/paramDefinition.js'
import buildWebinterface from './src/webinterface.js'
import { logUnknownRequest, runUpdateCheck, handleSigInt } from './src/utils.js'
import CURRENT_VERSION from './currentVersion.js'

import InfluxDbAction from './src/actions/InfluxDbAction.js'

handleSigInt()

let config = {}
let influxAction = null
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
}

const app = express()
const port = 80

app.use(express.json())
app.use(morgan('combined'))

let updateAvailable = false
let currentData = {}
let currentStatuses = {}
let lastUpdate = null

runUpdateCheck(CURRENT_VERSION, () => updateAvailable = true)

app.get('/', (req, res) => {
  res.send(buildWebinterface(currentData, lastUpdate, updateAvailable))
})

app.get('/values.json', (req, res) => {
  res.type('json').send(currentData)
})

app.get('/status.json', (req, res) => {
  res.type('json').send(currentStatuses)
})

app.post('/logs.json', (req, res) => {
  try {
    const { data, statuses, unknownRequest } = paramConverter(req.body, paramDefinition)
    currentData = data
    currentStatuses = statuses
    lastUpdate = new Date()
    if (unknownRequest) {
      logUnknownRequest(req)
    }
    if (influxAction) {
      influxAction.update({ data })
    }
  } catch (e) {
    console.error(e)
    logUnknownRequest(req, e)
  }
  res.type('json').status(201).send({ 'next-log-level': 2, status: 'ok' })
})

app.post('/events.json', (req, res) => {
  logUnknownRequest(req)
  res.type('json').status(201).send({ 'next-log-level': 2, status: 'ok' })
})

app.route('*').all((req, res) => {
  logUnknownRequest(req)
  res.sendStatus(404)
})

app.listen(port, () => {
  console.log('Power interface started')
})
