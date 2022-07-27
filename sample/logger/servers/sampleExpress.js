const express = require('express');
const { Context } = require('../../../src');
const logger = require('../')(module);

const context = new Context(process.env.APP_NAME || 'Logger');
const sampleMiddleware = require('../middleware/sampleMiddleware');

const SampleController = require('../controller/SampleController');


const load = (server) => {
  server.use(context.express.bind(context));
  server.use(express.Router());
  server.use(sampleMiddleware);
  
  server.post('/sample', SampleController.post);
};

const init = (server) => {
  server.listen(8000, () => {
    load(server);

    logger.info('Server started.', { env: process.env.NODE_ENV });
  });
};

module.exports = init(express());