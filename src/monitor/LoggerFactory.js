const { basename } = require('path');
require('dotenv/config');
const cls = require('cls-hooked');
const winston = require('winston');
const { transports } = require('winston');

const {
  format,
  transports: { Http: WHttp, Console: WConsole, File: WFile, Stream: WStream },
} = winston;
const MESSAGE = Symbol.for('message');

class LoggerFactory {
  constructor(appName, options = {}) {
    this.appName = appName || process.env.APP_NAME;
    this.options = options;
    this.moduleName;
    this.log = winston.createLogger({
      level: 'debug',
      format: this.format(),
      transports: [this.transports()],
    });
  }

  setModule(module) {
    this.moduleName = basename(module.filename, '.js');
  }

  transports() {
    const { logHttp, logConsole, logFileError, logFile } = this.options;
    let transport = [];

    if (logHttp) {
      transports = [...transports, new WHttp(this.optsHttp())];
    }

    if (logConsole) {
      transports = [...transports, new WConsole(this.optsConsole())];
    }

    if (logFileError) {
      transports = [...transports, new WFile(this.optsFileError())];
    }

    if (logFile) {
      transports = [...transports, new WFile(this.optsFile())];
    }

    return transport;
  }

  optsHttp() {
    return {
      host: 'https://',
      // port: '',
      // path: '',
      level: 'debug',
      auth: { username: 'jhondoe', password: '#foo!', bearer: 'b.a$r' },
      agent: '',
      ssl: '',
      headers: {},
      silent: '',
      close: () => {},
      format: format.combine(() => {}),
    };
  }

  optsFileError() {
    return { filename: 'temp/logs/err.log', level: 'error' };
  }

  optsConsole() {
    return { format: this.consoleFormat() };
  }

  optsFile() {
    return { filename: 'temp/logs/combined.log' };
  }

  silence() {
    return ['production', 'prd'].includes(process.env.ENV.toLowerCase());
  }

  getRequestId() {
    const context = cls.getNamespace(this.appName);
    return context ? context.get('requestId') : 'NO_CONTEXT';
  }

  consoleFormat() {
    const consoleFormatter = (info) => {
      const { timestamp, level, message, metadata } = info;
      const meta = { metadata, requestId: this.getRequestId() };
      const json = JSON.stringify(meta);

      return `[${timestamp}][${this.moduleName}][${level}]: ${message} - ${json}`;
    };

    return format.combine(
      format(this.ignorePrivate)(),
      format.colorize({ all: true }),
      format.timestamp({ format: 'HH:mm:ss' }),
      format.printf(consoleFormatter)
    );
  }

  format() {
    const jsonFormatter = (info, _) => {
      const { timestamp, label, level, message, metadata } = info;
      const meta = { metadata, requestId: this.getRequestId() };
      const json = Object.assign({ timestamp, label, level, message }, meta);
      info[MESSAGE] = JSON.stringify(json);
      return info;
    };

    return format.combine(
      format(this.ignorePrivate)(),
      format.label({ label: this.appName }),
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.metadata({
        fillExcept: ['message', 'level', 'timestamp', 'label'],
      }),
      format(jsonFormatter)()
    );
  }

  ignorePrivate(info, opts) {
    if (info.private) {
      return false;
    }
    return info;
  }
}

module.exports = LoggerFactory;
