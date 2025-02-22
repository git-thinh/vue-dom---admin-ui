// eslint-disable-next-line no-unused-vars, no-var
var custom = {
  title: 'VueDom',
  // start provider config
  provider: {
    system: 'jeedom',
    jsonRpcApiUrl: 'https://10.0.0.0/core/api/jeeApi.php',
    websocketUrl: null,
    // websocketUrl: 'wss://10.0.0.0/socket/',
    readDelay: 5000,
    statisticsPeriod: 86400000,
    trendPeriod: 7200000,
    trendThreshold: 0.1,
  },
  // end provider config
  // start components config
  components: {
  },
  // end components config
}
