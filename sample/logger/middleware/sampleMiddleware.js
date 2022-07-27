const logger = require('../')(module);

module.exports = async (req, _, next) => {
  logger.info('Hello Middleware, doing pre-requisites...');

  await next();

  // logger.info('Bye Middleware, response handler.');
};