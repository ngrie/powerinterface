import Influx from 'influx'

class InfluxDbAction {
  constructor(config) {
    this.config = config
  }

  boot({ paramDefinition }) {
    this.connection = new Influx.InfluxDB({
      ...this.config,
      schema: Object.values(paramDefinition).map(param => ({
        measurement: param.key,
        fields: {
          value: Influx.FieldType.FLOAT,
        },
        tags: ['unit'],
      })),
    })

    this.connection.getDatabaseNames()
      .then(names => {
        if (!names.includes(this.config.database)) {
          return this.connection.createDatabase(this.config.database)
        }
      })
      .catch(err => {
        console.error('Influx error', err)
      })
  }

  update({ data }) {
    this.connection.writePoints(Object.entries(data).map(([name, paramData]) => ({
      measurement: name,
      tags: {
        unit: paramData.unit,
      },
      fields: {
        value: paramData.value,
      },
    })))
      .catch(err => {
        console.error('Influx write error', err)
      })
  }
}

export default InfluxDbAction
