const modules = {
  9: 'dcac',
  11: 'gridSensor',
  12: 'solar',
  16: 'platform',
  136: 'battery,'
}

const statusMapping = {
  88883457: 'winterMode',
  113263427: 'discharging',
}

const convert = ({ module_statuses, header, ...rest }, paramDefinition) => {
  const data = {}
  const statuses = {}
  let unknownRequest = false

  if (Object.keys(rest).length) {
    unknownRequest = true
  }

  module_statuses.forEach(module => {
    const id = module.module_id
    Object.entries(module).forEach(([objKey, value]) => {
      if (!objKey.startsWith('param_')) {
        if (!['module_id', 'status', 'version'].includes(objKey)) {
          unknownRequest = true
        }
        return
      }

      statuses[id] = statusMapping[module.status] || module.status

      const paramId = objKey.split('_').pop()
      if (!paramDefinition[`${id}.${paramId}`]) {
        unknownRequest = true
        return
      }

      const { key, ...definition } = paramDefinition[`${id}.${paramId}`]
      const formattedValue = definition.format(value)
      data[key] = {
        ...definition,
        value: formattedValue,
        rawValue: value,
        formattedValue: `${formattedValue} ${definition.unit}`,
      }
    })
  })

  return { data, statuses, unknownRequest }
}

export default convert
