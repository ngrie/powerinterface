import process from 'process'
import fs from 'fs'
import axios from 'axios'

const stringify = (input) => typeof input === 'object' ? JSON.stringify(input) : ''+input


const logUnknownRequest = (req, error) => {
  fs.appendFile('unknown_requests.txt', `${(new Date()).toISOString()} ${req.method} ${req.hostname}${req.path} ${stringify(req.body)}${error ? '\nError while handling request: '+error : ''}\n\n`, err => {
    if (err) console.error('Error occurred while saving to unknown_requests.txt', err)
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

const handleSigInt = () => {
  process.on('SIGINT', () => {
    console.info('SIGINT received, exiting ...')
    process.exit(0)
  })
}

export {
  logUnknownRequest,
  runUpdateCheck,
  handleSigInt,
}
