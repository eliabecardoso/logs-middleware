const { basename } = require('path');
const cls = require('cls-hooked');
const winston = require('winston');
const AWSCloudWatch = require('winston-aws-cloudwatch');
const Ajv = require('ajv').default;

const {
  format,
  transports: { Http: WHttp, Console: WConsole, File: WFile, Stream: WStream },
} = winston;
const MESSAGE = Symbol.for('message');

class LoggerError extends Error {
  constructor(message) {
    super(message);
    this.name = LoggerError.name;
  }
}

class LoggerFactory {
  constructor(appName, options = {}) {
    const ajv = new Ajv();
    if (!ajv.validate({}, options)) {
      throw new LoggerError(ajv.errors);
    }
    this.appName = appName || process.env.APP_NAME;
    this.options = options;
    this.moduleName;
    this.logger = winston.createLogger({
      level: options.level,
      format: this.format(options),
      transports: [...this.transports()],
    });
  }

  setModule(module) {
    this.moduleName = basename(module.filename);
  }

  transports() {
    const {
      console: consoleConfig,
      streams: streamsConfig = [],
      files: filesSetup = [],
      https: httpConnections = [],
      awscws: awscwConnections = [],
    } = this.options.transporters;
    let transport = [];

    if (consoleConfig) {
      transport = [...transport, new WConsole(this.optsConsole(consoleConfig))];
    }

    return [
      ...transport,
      ...streamsConfig.map((stream) => new WStream(stream)),
      ...filesSetup.map((file) => new WFile(file)),
      ...httpConnections.map((http) => new WHttp(http)),
      ...awscwConnections.map((cw) => new AWSCloudWatch(cw)),
    ];
  }

  optsConsole({ level = 'debug', format, opts } = {}) {
    return {
      level,
      format: (format && format(opts)) || this.consoleFormat(opts),
    };
  }

  silence() {
    return ['production', 'prod', 'prd'].includes(
      process.env.NODE_ENV.toLowerCase()
    );
  }

  getContextMetadata() {
    const ctx = cls.getNamespace(this.appName);
    if (!ctx) return;
    return {
      requestId: ctx.get('requestId'),
    };
  }

  consoleFormat({ colorize = false } = {}) {
    const consoleFormatter = (info) => {
      const { timestamp, level, message, metadata } = info;
      const meta = { metadata, ...this.getContextMetadata() };
      const json = JSON.stringify(meta);

      return `[${timestamp}][${level}]: ${message} - ${json}`;
    };

    return format.combine(
      format(this.privateLog)(),
      format.colorize({ all: colorize }),
      format.timestamp({ format: 'HH:mm:ss.SSS' }),
      format.printf(consoleFormatter)
    );
  }

  format(opts) {
    const jsonFormatter = (info, _) => {
      const { timestamp, label, level, message, metadata } = info;
      const meta = {
        metadata: {
          ...this.sanitizeMetadata(metadata, opts),
          ...this.getContextMetadata(),
        },
      };

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

  sanitizeMetadata(data, opts) {
    if (!opts.sensitiveMetadata) return data;
    return Object.keys(data)
      .filter((k) => ![...opts.sensitiveMetadata].includes(k))
      .reduce((obj, cur) => ({ ...obj, [cur]: data[cur] }));
  }

  privateLog(info, opts) {
    const hide = info.private && !opts.transporters.awscw;
    if (hide) {
      return false;
    }
    return info;
  }
}

module.exports = LoggerFactory;
