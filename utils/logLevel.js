const LOG_LEVEL_ENUM = {
  off: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  critical: 5,
};

const isDebug = (logLevel) => getLogLevel(logLevel) >= getLogLevel('debug');
const isInfo = (logLevel) => getLogLevel(logLevel) >= getLogLevel('info');
const isWarn = (logLevel) => getLogLevel(logLevel) >= getLogLevel('warn');
const isError = (logLevel) => getLogLevel(logLevel) >= getLogLevel('error');
const isCritical = (logLevel) =>
  getLogLevel(logLevel) >= getLogLevel('critical');

const getLogLevel = (input) => {
  if (typeof input === 'string') {
    return LOG_LEVEL_ENUM[input] || 0;
  }
  if (typeof input === 'number') {
    return Object.values(LOG_LEVEL_ENUM)[input] || 0;
  }
  return 0;
};

const exported = getLogLevel;
exported.debug = isDebug;
exported.info = isInfo;
exported.warn = isWarn;
exported.error = isError;
exported.critical = isCritical;

module.exports = exported;
