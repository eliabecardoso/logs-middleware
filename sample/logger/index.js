const fs = require('fs');
fs.rmdirSync(`${process.cwd()}/temp`, { recursive: true });

require('dotenv/config');
const { logger4bee } = require('../../src');

module.exports = logger4bee;
