const reset = (input) => `\u001B[0m${input}\u001B[0m`;
const bold = (input) => `\u001B[1m${input}\u001B[22m`;
const dim = (input) => `\u001B[2m${input}\u001B[22m`;
const italic = (input) => `\u001B[3m${input}\u001B[23m`;
const underline = (input) => `\u001B[4m${input}\u001B[24m`;
const overline = (input) => `\u001B[53m${input}\u001B[55m`;
const inverted = (input) => `\u001B[7m${input}\u001B[27m`;
const hidden = (input) => `\u001B[8m${input}\u001B[28m`;
const strikethrough = (input) => `\u001B[9m${input}\u001B[29m`;

const black = (input) => `\u001B[30m${input}\u001B[39m`;
const red = (input) => `\u001B[31m${input}\u001B[39m`;
const green = (input) => `\u001B[32m${input}\u001B[39m`;
const yellow = (input) => `\u001B[33m${input}\u001B[39m`;
const blue = (input) => `\u001B[34m${input}\u001B[39m`;
const magenta = (input) => `\u001B[35m${input}\u001B[39m`;
const cyan = (input) => `\u001B[36m${input}\u001B[39m`;
const white = (input) => `\u001B[37m${input}\u001B[39m`;
const blackBright = (input) => `\u001B[90m${input}\u001B[39m`;
const redBright = (input) => `\u001B[91m${input}\u001B[39m`;
const greenBright = (input) => `\u001B[92m${input}\u001B[39m`;
const yellowBright = (input) => `\u001B[93m${input}\u001B[39m`;
const blueBright = (input) => `\u001B[94m${input}\u001B[39m`;
const magentaBright = (input) => `\u001B[95m${input}\u001B[39m`;
const cyanBright = (input) => `\u001B[96m${input}\u001B[39m`;
const whiteBright = (input) => `\u001B[97m${input}\u001B[39m`;

const invertedBlack = (input) => inverted(black(`${input}`));
const invertedRed = (input) => inverted(red(`${input}`));
const invertedGreen = (input) => inverted(green(`${input}`));
const invertedYellow = (input) => inverted(yellow(`${input}`));
const invertedBlue = (input) => inverted(blue(`${input}`));
const invertedMagenta = (input) => inverted(magenta(`${input}`));
const invertedCyan = (input) => inverted(cyan(`${input}`));
const invertedWhite = (input) => inverted(white(`${input}`));

const bgBlack = (input) => `\u001B[40m${input}\u001B[49m`;
const bgRed = (input) => `\u001B[41m${input}\u001B[49m`;
const bgGreen = (input) => `\u001B[42m${input}\u001B[49m`;
const bgYellow = (input) => `\u001B[43m${input}\u001B[49m`;
const bgBlue = (input) => `\u001B[44m${input}\u001B[49m`;
const bgMagenta = (input) => `\u001B[45m${input}\u001B[49m`;
const bgCyan = (input) => `\u001B[46m${input}\u001B[49m`;
const bgWhite = (input) => `\u001B[47m${input}\u001B[49m`;
const bgBlackBright = (input) => `\u001B[100m${input}\u001B[49m`;
const bgRedBright = (input) => `\u001B[101m${input}\u001B[49m`;
const bgGreenBright = (input) => `\u001B[102m${input}\u001B[49m`;
const bgYellowBright = (input) => `\u001B[103m${input}\u001B[49m`;
const bgBlueBright = (input) => `\u001B[104m${input}\u001B[49m`;
const bgMagentaBright = (input) => `\u001B[105m${input}\u001B[49m`;
const bgCyanBright = (input) => `\u001B[106m${input}\u001B[49m`;
const bgWhiteBright = (input) => `\u001B[107m${input}\u001B[49m`;

module.exports = {
  reset,
  bold,
  dim,
  italic,
  underline,
  overline,
  inverted,
  hidden,
  strikethrough,
  black,
  red,
  green,
  yellow,
  blue,
  magenta,
  cyan,
  white,
  blackBright,
  redBright,
  greenBright,
  yellowBright,
  blueBright,
  magentaBright,
  cyanBright,
  whiteBright,
  invertedBlack,
  invertedRed,
  invertedGreen,
  invertedYellow,
  invertedBlue,
  invertedMagenta,
  invertedCyan,
  invertedWhite,
  bgBlack,
  bgRed,
  bgGreen,
  bgYellow,
  bgBlue,
  bgMagenta,
  bgCyan,
  bgWhite,
  bgBlackBright,
  bgRedBright,
  bgGreenBright,
  bgYellowBright,
  bgBlueBright,
  bgMagentaBright,
  bgCyanBright,
  bgWhiteBright,
};
