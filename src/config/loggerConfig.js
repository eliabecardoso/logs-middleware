require('dotenv/config');

const rootPath = process.cwd();

const config = {
  development: {
    level: 'warn',
    transporters: {
      console: { level: 'debug', opts: { colorize: true } },
      files: [
        { filename: `${rootPath}/temp/logs/all.log` },
        { filename: `${rootPath}/temp/logs/error.log`, level: 'error' },
      ],
    },
  },
  'prd|production': {
    level: 'warn',
    transporters: {
      awscws: [{}],
    },
  },
};

const getEnvConfig = (obj) =>
  Object.keys(obj).find((key) =>
    key.split('|').some((k) => !!k.match(process.env.NODE_ENV))
  );

module.exports = config[getEnvConfig(config)];
