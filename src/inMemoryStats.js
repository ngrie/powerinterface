const initStats = () => ({
  dataSince: { daily: new Date(), monthly: new Date() },
  data: {
    solarEnergy: { daily: null, monthly: null },
    energyPlatformProduced: { daily: null, monthly: null },
  },
})

const updateStats = (newData, stats) => {
  const now = new Date()
  let resetDaily = false
  let resetMonthly = false
  if (!stats.dataSince.daily || now.getHours() < stats.dataSince.daily.getHours()) {
    stats.dataSince.daily = now
    resetDaily = true
  }
  if (!stats.dataSince.monthly || now.getDate() < stats.dataSince.monthly.getDate()) {
    stats.dataSince.monthly = now
    resetMonthly = true
  }

  Object.entries(stats.data).forEach(([key, data]) => {
    const newValue = newData[key]
    if (!newValue) {
      return
    }

    if (resetDaily || stats.data[key].daily === null) {
      stats.data[key].daily = { ...newValue }
    }
    if (resetMonthly || stats.data[key].monthly === null) {
      stats.data[key].monthly = { ...newValue }
    }
  })
}

export {
  initStats,
  updateStats,
}
