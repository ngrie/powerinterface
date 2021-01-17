import fs from 'fs'
import axios from 'axios'

const logUnknownRequest = (req, error) => {
  fs.appendFile('unknown_requests.txt', `${(new Date()).toISOString()} ${req.method} ${req.hostname}${req.path} ${typeof req.body === 'object' ? JSON.stringify(req.body) : req.body}${error ? '\nError while handling request: '+error : ''}\n\n`, err => {
    if (err) console.error('Error occurred while saving to unknown_requests.txt', err)
  })
}

const logPowerrouterResponse = (data) => {
  const text = data.status ? `${data.status} ${data.data}` : ''+data
  fs.appendFile('powerrouter_responses.txt', `${(new Date()).toISOString()} ${text}\n\n`, err => {
    if (err) console.error('Error occurred while saving to powerrouter_responses.txt', err)
  })
}

const runUpdateCheck = (currentTagName, onUpdateAvailable) => {
  axios('https://api.github.com/repos/ngrie/powerinterface/releases/latest')
    .then(({ data }) => {
      if (data.tag_name !== currentTagName) {
        onUpdateAvailable()
      }
    })
    .catch(() => {
      // fail silently
    })
    .finally(() => {
      setTimeout(
        () => runUpdateCheck(currentTagName, onUpdateAvailable),
        1000 * 60 * 60 * 6, // six hours
      )
    })
}

export {
  logUnknownRequest,
  logPowerrouterResponse,
  runUpdateCheck,
}
