const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

const solver = require('../anotherSolver');
const Logger = require('../utils/logger');
const timestamp = require('../utils/timestamp');

const config = {
  recorder: {
    followNewTab: true,
    fps: 25,
  },
  savePath: `./ScreenRecordings/demo-cod-${timestamp('-')}.mp4`,
  puppeteer: {
    headless: true,
    args: [
      '--window-size=360,700',
      '--window-position=000,000',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=site-per-process',
      '--disable-features=IsolateOrigins',
      '--disable-site-isolation-trials',
    ],
    timeout: 10000,
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
  log.info('Navigating to login page');
  await page.goto('https://profile.callofduty.com/cod/login', {
    waitUntil: 'networkidle2',
  });

  try {
    log.info('Attempting to solve');
    await solver.solve(page);
    log.info('Successfully solved');
  } catch (error) {
    log.critical('Something went wrong');
  } finally {
    log.debug('Stopping screen recording');
    await recorder.stop();
    log.debug('Closing browser window');
    await browser.close();
    process.exit(1);
  }
}

console.log('`ctrl + c` to exit');

run();
