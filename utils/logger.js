const { blue, cyan, yellow, red, inverted, dim, bold } = require('./color');
const timestamp = require('./timestamp');
const loglevel = require('./logLevel');

class Logger {
  logLevel;
  constructor(options) {
    this.logLevel = loglevel(options.logLevel || process.env.LOG_LEVEL);
  }

  stdout = (message, flag) =>
    process.stdout.write(`${flag} ${timestamp()} ${message}\n`);

  stderr = (message, flag) =>
    process.stdout.write(`${flag} ${timestamp()} ${message}\n`);

  debug(message) {
    if (loglevel.debug(this.logLevel)) {
      this.stdout(message, inverted(blue(' DEBU ')));
    }
  }
  info(message) {
    if (loglevel.info(this.logLevel)) {
      this.stdout(message, inverted(cyan(' INFO ')));
    }
  }
  warn(message) {
    if (loglevel.warn(this.logLevel)) {
      this.stdout(message, inverted(yellow(' WARN ')));
    }
  }
  error(message) {
    if (loglevel.error(this.logLevel)) {
      this.stderr(message, inverted(dim(red(' ERRR '))));
    }
  }
  critical(message) {
    if (loglevel.critical(this.logLevel)) {
      this.stderr(message, bold(inverted(red(' CRIT '))));
    }
  }
}

module.exports = Logger;
