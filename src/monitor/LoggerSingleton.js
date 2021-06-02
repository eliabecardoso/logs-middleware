const LoggerFactory = require('./LoggerFactory');

const { transformStringToKeyValue } = require('./utils');

const logTypesEnv =
  'http=false;httpWarn=false;console=true;file=false;fileWarn=true';

const config = () => {
  return {
    types: transformStringToKeyValue(logTypesEnv), // process.env.LOG_TYPES
  };
};

module.exports = ((appName, options = {}) => {
  let instance;
  return (module) => {
    if (!instance) {
      instance = new LoggerFactory(appName, options);
    }
    instance.setModule(module);
    return instance.log;
  };
})(process.APP_NAME || 'Compliance', config());
