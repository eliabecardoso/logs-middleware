const logger = require('../')(module);

const sleep = () => new Promise(resolve => {
  setTimeout(resolve, Math.floor(Math.random() * (5000 - 1 + 1) + 1));
});

const sampleService = require('../service/SampleService');

class SampleController {
  async post(req, res, next) {
    logger.info('Hello Controller, req.body: ', req.body);

    await sleep();

    await sampleService.post(req.body);

    logger.info('Bye Controller');

    return res.send('Logged.');
  }
};

module.exports = new SampleController();
