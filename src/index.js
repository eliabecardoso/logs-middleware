require('dotenv/config');
const Context = require('./monitor/Context');
const LoggerFactory = require('./monitor/LoggerFactory');
const LoggerSingleton = require('./monitor/LoggerSingleton');

module.exports = {
  Context,
  LoggerFactory,
  LoggerSingleton,
};

new Context('Compliance');
new Context('Compliance');
