const LOG_LEVEL_ENUM = {
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  critical: 5,
  off: 6,
};

module.exports = (input = 'debug') => {
  score = LOG_LEVEL_ENUM[input];

  return Object.entries(LOG_LEVEL_ENUM).reduce((result, [level, value]) => {
    result[level] = score <= value;
    return result;
  }, {});
};
