const { basename } = require('path');
const cls = require('cls-hooked');
const winston = require('winston');
const AWSCloudWatch = require('winston-aws-cloudwatch');

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
      transports: [...this.transports()],
    });
  }

  setModule(module) {
    this.moduleName = basename(module.filename, '.js');
  }

  transports() {
    const {
      http,
      httpWarn,
      console: consoleLog,
      file,
      fileWarn,
    } = this.options.types;
    let transport = [];

    if (http) {
      transport = [...transport, new WHttp(this.optsHttp())];
    }

    if (httpWarn) {
      transport = [...transport, new WHttp(this.optsHttp())];
    }

    if (consoleLog !== false) {
      transport = [...transport, new WConsole(this.optsConsole())];
    }

    if (file) {
      transport = [
        ...transport,
        new WFile(this.optsFile({ filename: 'temp/logs/combined.log' })),
      ];
    }

    if (fileWarn) {
      transport = [
        ...transport,
        new WFile(
          this.optsFile({ filename: 'temp/logs/error.log', level: 'warn' })
        ),
      ];
    }

    return transport;
  }

  optsHttp({ level = 'warn' } = {}) {
    return {
      level,
      host: 'https://',
      // port: '',
      // path: '',
      auth: { username: 'jhondoe', password: '@foo!', bearer: 'b.a$r' },
      agent: '',
      ssl: '',
      headers: {},
      close: () => {},
      format: this.format({ http: true }),
    };
  }

  optsConsole({} = {}) {
    return { format: this.consoleFormat() };
  }

  optsFile({ filename, level = 'debug' } = {}) {
    return { filename, level };
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
      format(this.privateLog)(),
      format.colorize({ all: true }),
      format.timestamp({ format: 'HH:mm:ss' }),
      format.printf(consoleFormatter)
    );
  }

  format(opts) {
    const jsonFormatter = (info, _) => {
      const { timestamp, label, level, message, metadata } = info;
      const meta = { metadata, requestId: this.getRequestId() };
      const json = Object.assign({ timestamp, label, level, message }, meta);
      info[MESSAGE] = JSON.stringify(json);
      return info;
    };

    return format.combine(
      format(this.privateLog)(opts),
      format.label({ label: this.appName }),
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.metadata({
        fillExcept: ['message', 'level', 'timestamp', 'label'],
      }),
      format(jsonFormatter)()
    );
  }

  privateLog(info, opts) {
    const hide = info.private && !opts.http;
    if (hide) {
      return false;
    }
    return info;
  }
}

module.exports = LoggerFactory;
