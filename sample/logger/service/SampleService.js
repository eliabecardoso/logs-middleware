const logger = require('../')(module);

class SampleService {
  async post(payload = {}) {
    logger.info('Hello Service.', { payload });

    if (payload.error) logger.error('Error Service, payload.error: ', payload.error);

    if (payload.warning) logger.warning('Warning Service, payload.warning: ', payload.warning);

    logger.info('Bye Service.', { payload });

    await new Promise(resolve => resolve());

    return true;
  }
};

module.exports = new SampleService();
