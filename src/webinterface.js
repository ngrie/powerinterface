const getValue = (item) => item ? item.formattedValue : '?'
const calculateStats = (key, range, currentData, stats) => {
  if (!currentData[key] || !stats.data || !stats.data[key] || !stats.data[key][range]) {
    return '?'
  }
  const raw = currentData[key].rawValue - stats.data[key][range].rawValue
  return `${currentData[key].format(raw)} ${currentData[key].unit}`
}
const buildStatsDailyLabel = (stats) => `seit ${stats.dataSince.daily.toLocaleTimeString(
  'de-DE',
  { hour: '2-digit', minute:'2-digit' }
)} Uhr`
const buildStatsMonthlyLabel = (stats) => `seit ${stats.dataSince.monthly.toLocaleDateString(
  'de-DE',
  { day: '2-digit', month:'2-digit' }
)}`

const buildPowerRouterIds = (powerRouterIds) => {
    let powerRouterIdsString = ''
    for (let powerRouterId of powerRouterIds) {
        powerRouterIdsString = powerRouterIdsString + '<a href="/?powerRouterId=' + powerRouterId + '" target="_blank">' + powerRouterId + '</a>' + ', '
    }
    powerRouterIdsString = powerRouterIdsString.slice(0, -2)
    return powerRouterIdsString
}

const buildHeader = () => `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Powerinterface</title>
    
    <style>
      table { margin-bottom: 15px }
      td:last-child { padding-left: 10px; font-weight: bold }
      .stats td:last-child { padding-left: inherit; font-weight: inherit }
      .stats td:not(:first-child) { padding-left: 10px }
    </style>
  </head>
  <body style="background-color: #dedede; font-family: Arial, serif">
    <div style="width: 600px; background-color: #fff; margin: 0 auto; padding: 15px">`

const buildFooter = (lastUpdate, updateAvailable, reload) => `
      <small>Last update: ${lastUpdate ? lastUpdate.toString() : 'never'}</small>
    </div>
    
    <div style="margin: 20px auto 10px auto; text-align: center">
      Status page provided by <a href="https://github.com/ngrie/powerinterface" target="_blank">Powerinterface</a>
      ${updateAvailable ? '<div style="margin-top: 10px"><strong>Update available!</strong> <a href="https://github.com/ngrie/powerinterface/releases" target="_blank">Read changelog</a> | <a href="https://github.com/ngrie/powerinterface#Updating" target="_blank">Learn how to update</a></div>' : ''}
    </div>
    
    ${reload && Number.isInteger(reload) && reload > 0 ? '<script type="text/javascript">setTimeout(function() { location.reload() }, ' + reload * 1000 + ')</script>' : ''}
  </body>
</html>
`

const buildTable = (data, stats, { isWinterMode, isMaintenanceCharge }) => `
<h3>PV Stränge</h3>
<div style="display: flex">
  <div style="width: 50%">
    <table style="border: 0">
      <tr><td>Solar Leistung gesamt</td><td>${getValue(data.solarPower)}</td></tr>
      <tr><td>Leistung Eingang 1</td><td>${getValue(data.line1Power)}</td></tr>
      <tr><td>Spannung Eingang 1</td><td>${getValue(data.line1Voltage)}</td></tr>
      <tr><td>Strom Eingang 1</td><td>${getValue(data.line1Current)}</td></tr>
      <tr><td>Temperatur Eingang 1</td><td>${getValue(data.line1Temperature)}</td></tr>
    </table>
  </div>
  <div>
    <table style="border: 0">
      <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
      <tr><td>Leistung Eingang 2</td><td>${getValue(data.line2Power)}</td></tr>
      <tr><td>Spannung Eingang 2</td><td>${getValue(data.line2Voltage)}</td></tr>
      <tr><td>Strom Eingang 2</td><td>${getValue(data.line2Current)}</td></tr>
      <tr><td>Temperatur Eingang 2</td><td>${getValue(data.line2Temperature)}</td></tr>
    </table>
  </div>
</div>

<h3>Netz & lokale Verbindung</h3>
<div style="display: flex">
  <div style="width: 50%">
    <table style="border: 0">
      <tr><td>Systemleistung</td><td>${getValue(data.systemPerformance)}</td></tr>
      <tr><td>Netzspannung</td><td>${getValue(data.lineVoltage)}</td></tr>
      <tr><td>Netzfrequenz</td><td>${getValue(data.lineFrequency)}</td></tr>
    </table>
  </div>
  <div>
    <table style="border: 0">
      <tr><td>Leistung am Local Out</td><td>${getValue(data.localOutPower)}</td></tr>
      <tr><td>Spannung am Local Out</td><td>${getValue(data.localOutVoltage)}</td></tr>
      <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
    </table>
  </div>
</div>

<h3>
  Batterie
  ${isWinterMode ? '[Wintermodus]' : ''}
  ${isMaintenanceCharge ? '[Wartungsladung]' : ''}
</h3>
<div style="display: flex">
  <div style="width: 50%">
    <table style="border: 0">
      <tr><td>Ladezustand</td><td>${getValue(data.stateOfCharge)}</td></tr>
      <tr><td>Leistung</td><td>${getValue(data.batteryPower)}</td></tr>
      <tr><td>Spannung</td><td>${getValue(data.batteryVoltage)}</td></tr>
      <tr><td>Strom</td><td>${getValue(data.batteryCurrent)}</td></tr>
      <tr><td>Batterie Temperatur</td><td>${getValue(data.batteryTemperature)}</td></tr>
    </table>
  </div>
</div>

<h3>Netzsensor</h3>
<div style="display: flex">
  <div style="width: 50%">
    <table style="border: 0">
      <tr><td>Sensor Leistung</td><td>${getValue(data.platformPower)}</td></tr>
      <tr><td>Leistung phase 1</td><td>${getValue(data.phase1Power)}</td></tr>
      <tr><td>Spannung phase 1</td><td>${getValue(data.phase1Voltage)}</td></tr>
      <tr><td>Strom phase 1</td><td>${getValue(data.phase1Current)}</td></tr>
      <tr><td>Leistung phase 3</td><td>${getValue(data.phase3Power)}</td></tr>
      <tr><td>Spannung phase 3</td><td>${getValue(data.phase3Voltage)}</td></tr>
      <tr><td>Strom phase 3</td><td>${getValue(data.phase3Current)}</td></tr>
    </table>
  </div>
  <div>
    <table style="border: 0">
      <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
      <tr><td>Leistung phase 2</td><td>${getValue(data.phase2Power)}</td></tr>
      <tr><td>Spannung phase 2</td><td>${getValue(data.phase2Voltage)}</td></tr>
      <tr><td>Strom phase 2</td><td>${getValue(data.phase2Current)}</td></tr>
      <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
      <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
      <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
    </table>
  </div>
</div>

<h3>Statistiken</h3>
<table class="stats" style="border: 0">
  <tr><td>&nbsp;</td><td>${buildStatsDailyLabel(stats)}</td><td>${buildStatsMonthlyLabel(stats)}</td><td>gesamt</td></tr>
  <tr>
    <td>Solarenergie produziert</td>
    <td>${calculateStats('solarEnergy', 'daily', data, stats)}</td>
    <td>${calculateStats('solarEnergy', 'monthly', data, stats)}</td>
    <td>${getValue(data.solarEnergy)}</td>
  </tr>
  <tr>
    <td>Energie eingespeist</td>
    <td>${calculateStats('energyPlatformProduced', 'daily', data, stats)}</td>
    <td>${calculateStats('energyPlatformProduced', 'monthly', data, stats)}</td>
    <td>${getValue(data.energyPlatformProduced)}</td>
  </tr>
</table>
`

const buildNoDataMessage = () => `
<div style="width: 80%; margin: 20px auto; background-color: #EFF6FF; color: #1D4ED8; padding: 10px 15px;">
  <p>
    No data has been received since the Powerinterface has been started.
    If you already configured your DNS properly, your PowerRouter device should start sending data in a few seconds.
  </p>
  <p>
    Check the <a href="https://github.com/ngrie/powerinterface" target="_blank">Powerinterface GitHub page</a> if you need any help.
  </p>
  
</div>
`

const buildWebinterface = (powerRouterId, powerRouterIds, data, stats, status, config, lastUpdate, updateAvailable = false) => `
${buildHeader()}
${powerRouterId ? '<p>Aktuelle Powerrouter ID: ' + powerRouterId + '</p>' : ''}
${powerRouterIds ? '<p>Verfügbare Powerrouter IDs: ' + buildPowerRouterIds(powerRouterIds) + '</p>' : ''}
${lastUpdate ? buildTable(data, stats, status) : buildNoDataMessage()}
${buildFooter(lastUpdate, updateAvailable, config.webReload)}
`

export default buildWebinterface
