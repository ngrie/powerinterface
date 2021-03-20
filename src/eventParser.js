const DATE_PADDING = 1199142000

const convertHex = (s) => s.match(/.{1,2}/g).reverse().join('')

const parseEvent = (e) => {
  if (typeof e !== 'string' || e.length !== 88) {
    throw new Error('Unknown event input')
  }

  const hexParts = {
    date: e.substr(0, 8),
    code: e.substr(12, 2),
    moduleState: e.substr(16, 2),
    previousModuleState: e.substr(18, 2),
    cause: e.substr(32, 2),
    dcBus: e.substr(40, 4),
    acOutVoltage: e.substr(44, 4),
    inverterCurrent: e.substr(48, 4),
    gridVoltage: e.substr(52, 4),
    gridCurrent: e.substr(56, 4),
    gridFrequency: e.substr(60, 4),
    platformFrequency: e.substr(64, 4),
    unknownFrequency1: e.substr(68, 4),
    voltage: e.substr(76, 4),
    unknownFrequency2: e.substr(84, 4),
  }

  return {
    date: new Date((parseInt(convertHex(hexParts.date), 16) + DATE_PADDING) * 1000),
    code: parseInt(hexParts.code, 16),
    moduleState: parseInt(hexParts.moduleState, 16),
    previousModuleState: parseInt(hexParts.previousModuleState, 16),
    cause: parseInt(hexParts.cause, 16),
    dcBus: parseInt(convertHex(hexParts.dcBus), 16) / 100,
    acOutVoltage: parseInt(convertHex(hexParts.acOutVoltage), 16) / 100,
    inverterCurrent: parseInt(convertHex(hexParts.inverterCurrent), 16) / 100,
    gridVoltage: parseInt(convertHex(hexParts.gridVoltage), 16) / 100,
    gridCurrent: parseInt(convertHex(hexParts.gridCurrent), 16) / 100,
    gridFrequency: parseInt(convertHex(hexParts.gridFrequency), 16) / 100,
    platformFrequency: parseInt(convertHex(hexParts.platformFrequency), 16) / 100,
    unknownFrequency1: parseInt(convertHex(hexParts.unknownFrequency1), 16) / 100,
    voltage: parseInt(convertHex(hexParts.voltage), 16) / 100,
    unknownFrequency2: parseInt(convertHex(hexParts.unknownFrequency2), 16) / 100,
  }
}

const isWinterModeStartedEvent = (e) => e.code === 85
const isWinterModeEndedEvent = (e) => e.code === 86
const isMaintenanceChargeStartedEvent = (e) => e.code === 48
const isMaintenanceChargeEndedEvent = (e) => e.code === 51

export {
  parseEvent,
  isWinterModeStartedEvent,
  isWinterModeEndedEvent,
  isMaintenanceChargeStartedEvent,
  isMaintenanceChargeEndedEvent,
}
