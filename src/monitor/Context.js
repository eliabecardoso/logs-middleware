const cls = require('cls-hooked');
const { v4 } = require('uuid');

class Context {
  constructor(appName) {
    this.appName = appName;
    this.namespace = cls.createNamespace(appName);
    // this.namespace.run(() => {
    //   this.namespace.set('requestId', v4());
    //   const logger = require('./LoggerSingleton')(module);

    //   logger.info('Vai lá, vai beber, vai lembrar, vai ligar...:', {
    //     payload: { a: 1, b: { c: 3 } },
    //     obj: {},
    //   });
    //   logger.error(new Error('Somebody call 911'));
    //   logger.warn('test', { abc: 1 });
    //   logger.debug('test', { abc: 1 });
    //   console.log('>');
    // });
  }

  get(key) {
    if (!this.namespace || !this.namespace.active) {
      return;
    }

    return this.namespace.get(key);
  }

  set(key, value) {
    if (!this.namespace || !this.namespace.active) {
      return;
    }

    this.namespace.set(key, value);
  }

  static getRequestId() {
    return this.namespace.get('requestId');
  }

  setup(req, res, next) {
    this.namespace.bindEmitter(req);
    this.namespace.bindEmitter(res);
    this.namespace.run(() => {
      this.namespace.set('requestId', req.headers['x-request-id'] || v4());
      next();
    });
  }

  express(...args) {
    return this.setup(...args);
  }

  koa(ctx, ...args) {
    return this.setup(ctx.req, ctx.res, ...args);
  }
} 

module.exports = Context;
