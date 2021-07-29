const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

const solve = require('../index');
const Logger = require('../utils/logger');
const timestamp = require('../utils/timestamp');

const config = {
  recorder: {
    followNewTab: true,
    fps: 25,
  },
  savePath: `./ScreenRecordings/simple-${timestamp('-')}.mp4`,
  puppeteer: {
    headless: false,
    args: [
      '--window-size=360,700',
      '--window-position=000,000',
      '--no-sandbox',
      '--disable-dev-shm-usage',
    ],
  },
};

async function run() {
  puppeteer.use(pluginStealth());

  const log = new Logger({ logLevel: 'critical' });

  log.debug('Launching Puppeteer');
  const browser = await puppeteer.launch(config.puppeteer);

  log.debug('Creating browser window');
  const page = await browser.newPage();
  const recorder = new PuppeteerScreenRecorder(page, config.recorder);

  log.debug('Starting screen recording');
  await recorder.start(config.savePath);

  await page.setDefaultNavigationTimeout(0);
  log.info('Navigating to demo page');
  page.goto('https://www.google.com/recaptcha/api2/demo');

  try {
    log.info('Attempting to solve');
    await solve(page);
    log.info('Successfully solved');
    log.debug('Stopping screen recording');
    await recorder.stop();
    log.debug('Closing browser window');
    await browser.close();
    process.exit(0);
  } catch (error) {
    log.critical(error);
    log.debug('Stopping screen recording');
    await recorder.stop();
    log.debug('Closing browser window');
    await browser.close();
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  console.log('bye!');
  process.exit();
});

run();
