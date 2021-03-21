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

  module_statuses.forEach(module => {
    const id = module.module_id
    Object.entries(module).forEach(([objKey, value]) => {
      if (!objKey.startsWith('param_')) {
        return
      }

      statuses[id] = statusMapping[module.status] || module.status

      const paramId = objKey.split('_').pop()
      if (!paramDefinition[`${id}.${paramId}`]) {
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

  return { data, statuses }
}

export default convert
