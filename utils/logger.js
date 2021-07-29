const colors = require('./color');
const timestamp = require('./timestamp');
const loglevel = require('./logLevel');

class Logger {
  level;
  timestamps;
  flags;

  constructor(options = {}) {
    this.timestamps = options.timestamps === undefined || !!options.timestamps;
    this.flags = options.timestamps === undefined || !!options.flags;
    this.level = loglevel(options.level || process.env.LOG_LEVEL);
  }

  stdout = (message, flag) => {
    const now = this.timestamps ? `${timestamp()}: ` : '';
    return process.stdout.write(`${flag}${now}${message}\n`);
  };

  stderr = (message, flag) => {
    const now = this.timestamps ? `${timestamp()}: ` : '';
    return process.stdout.write(`${flag}${now}${message}\n`);
  };

  flag(contents, color) {
    if (!this.flags) {
      return '';
    }
    const flagText = contents.toUpperCase().padStart(5, ' ').padEnd(6, ' ');
    return colors.inverted(colors[color](`${flagText}`)) + ' ';
  }

  debug(message) {
    if (!this.level.debug) {
      return;
    }
    this.stdout(message, this.flag('dbug', 'blue'));
  }

  info(message) {
    if (!this.level.info) {
      return;
    }
    this.stdout(message, this.flag('info', 'cyan'));
  }

  warn(message) {
    if (!this.level.warn) {
      return;
    }
    this.stdout(message, this.flag('warn', 'yellow'));
  }

  error(message) {
    if (!this.level.error) {
      return;
    }
    this.stderr(message, this.flag('errr', 'red'));
  }

  critical(message) {
    if (!this.level.critical) {
      return;
    }
    this.stderr(colors.red(message), this.flag('crit', 'redBright'));
  }
}

module.exports = Logger;
