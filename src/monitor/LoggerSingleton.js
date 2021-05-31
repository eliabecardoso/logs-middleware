const LoggerFactory = require('./LoggerFactory');

const config = () => {
  return {
    logConsole: true,
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
})(process.APP_NAME || config());
