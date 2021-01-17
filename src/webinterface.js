const buildHeader = () => `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Powerinterface</title>
    
    <style>
      table { margin-bottom: 15px }
      td:last-child { padding-left: 10px; font-weight: bold }
    </style>
  </head>
  <body style="background-color: #dedede; font-family: Arial, serif">
    <div style="width: 600px; background-color: #fff; margin: 0 auto; padding: 15px">`

const buildFooter = (lastUpdate, updateAvailable) => `
      <small>Last update: ${lastUpdate ? lastUpdate.toString() : 'never'}</small>
    </div>
    
    <div style="margin: 20px auto 10px auto; text-align: center">
      Status page provided by <a href="https://github.com/ngrie/powerinterface" target="_blank">Powerinterface</a>
      ${updateAvailable ? ' - <strong>Update available!</strong> <a href="https://github.com/ngrie/powerinterface#Updating" target="_blank">Learn how to update</a>' : ''}
    </div>
  </body>
</html>
`

const buildTable = (data) => `
<h3>PV Stränge</h3>
<div style="display: flex">
  <div style="width: 50%">
    <table style="border: 0">
      <tr><td>Solar Leistung gesamt</td><td>${data.solarPower.formattedValue}</td></tr>
      <tr><td>Leistung Eingang 1</td><td>${data.line1Power.formattedValue}</td></tr>
      <tr><td>Spannung Eingang 1</td><td>${data.line1Voltage.formattedValue}</td></tr>
      <tr><td>Strom Eingang 1</td><td>${data.line1Current.formattedValue}</td></tr>
      <tr><td>Temperatur Eingang 1</td><td>${data.line1Temperature.formattedValue}</td></tr>
    </table>
  </div>
  <div>
    <table style="border: 0">
      <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
      <tr><td>Leistung Eingang 2</td><td>${data.line1Power.formattedValue}</td></tr>
      <tr><td>Spannung Eingang 2</td><td>${data.line2Voltage.formattedValue}</td></tr>
      <tr><td>Strom Eingang 2</td><td>${data.line2Current.formattedValue}</td></tr>
      <tr><td>Temperatur Eingang 2</td><td>${data.line2Temperature.formattedValue}</td></tr>
    </table>
  </div>
</div>

<h3>Netz & lokale Verbindung</h3>
<div style="display: flex">
  <div style="width: 50%">
    <table style="border: 0">
      <tr><td>Systemleistung</td><td>${data.systemPerformance.formattedValue}</td></tr>
      <tr><td>Netzspannung</td><td>${data.lineVoltage.formattedValue}</td></tr>
      <tr><td>Netzfrequenz</td><td>${data.lineFrequency.formattedValue}</td></tr>
    </table>
  </div>
  <div>
    <table style="border: 0">
      <tr><td>Leistung am Local Out</td><td>${data.localOutPower.formattedValue}</td></tr>
      <tr><td>Spannung am Local Out</td><td>${data.localOutVoltage.formattedValue}</td></tr>
      <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
    </table>
  </div>
</div>

<h3>Batterie</h3>
<div style="display: flex">
  <div style="width: 50%">
    <table style="border: 0">
      <tr><td>Ladezustand</td><td>${data.stateOfCharge.formattedValue}</td></tr>
      <tr><td>Leistung</td><td>${data.batteryPower.formattedValue}</td></tr>
      <tr><td>Spannung</td><td>${data.batteryVoltage.formattedValue}</td></tr>
      <tr><td>Strom</td><td>${data.batteryCurrent.formattedValue}</td></tr>
      <tr><td>Batterie Temperatur</td><td>${data.batteryTemperature.formattedValue}</td></tr>
    </table>
  </div>
</div>

<h3>Netzsensor</h3>
<div style="display: flex">
  <div style="width: 50%">
    <table style="border: 0">
      <tr><td>Sensor Leistung</td><td>${data.platformPower.formattedValue}</td></tr>
      <tr><td>Leistung phase 1</td><td>${data.phase1Power.formattedValue}</td></tr>
      <tr><td>Spannung phase 1</td><td>${data.phase1Voltage.formattedValue}</td></tr>
      <tr><td>Strom phase 1</td><td>${data.phase1Current.formattedValue}</td></tr>
      <tr><td>Leistung phase 3</td><td>${data.phase3Power.formattedValue}</td></tr>
      <tr><td>Spannung phase 3</td><td>${data.phase3Voltage.formattedValue}</td></tr>
      <tr><td>Strom phase 3</td><td>${data.phase3Current.formattedValue}</td></tr>
    </table>
  </div>
  <div>
    <table style="border: 0">
      <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
      <tr><td>Leistung phase 2</td><td>${data.phase2Power.formattedValue}</td></tr>
      <tr><td>Spannung phase 2</td><td>${data.phase2Voltage.formattedValue}</td></tr>
      <tr><td>Strom phase 2</td><td>${data.phase2Current.formattedValue}</td></tr>
      <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
      <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
      <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
    </table>
  </div>
</div>
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

const buildWebinterface = (data, lastUpdate, updateAvailable = false) => `
${buildHeader()}
${lastUpdate ? buildTable(data) : buildNoDataMessage()}
${buildFooter(lastUpdate, updateAvailable)}
`

export default buildWebinterface
