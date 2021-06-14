const LoggerFactory = require('./LoggerFactory');
require('winston-aws-cloudwatch');

// const path = require('path');
// console.log('#', path.resolve(__dirname), require.main.path, process.cwd());

module.exports = ((appName, options = {}) => {
  let instance;
  return (module) => {
    if (!instance) {
      instance = new LoggerFactory(appName, options);
    }
    instance.setModule(module);
    return instance.log;
  };
})(
  process.APP_NAME || 'Compliance',
  require(`${process.cwd()}/src/config/loggerConfig`)
);
