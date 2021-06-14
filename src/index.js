require('dotenv/config');
const Context = require('./monitor/Context');
const LoggerFactory = require('./monitor/LoggerFactory');
const LoggerSingleton = require('./monitor/LoggerSingleton');

new Context('Compliance');
new Context('Compliance');

module.exports = {
  Context,
  LoggerFactory,
  logger4bee: LoggerSingleton,
};
