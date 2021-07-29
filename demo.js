const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

const config = {
  followNewTab: true,
  fps: 25,
};
const savePath = './demo.mp4';

const solve = require('../index.js');

async function run() {
  puppeteer.use(pluginStealth());

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--window-size=360,700',
      '--window-position=000,000',
      '--no-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  const page = await browser.newPage();
  const recorder = new PuppeteerScreenRecorder(page, config);

  await recorder.start(savePath);
  await page.setDefaultNavigationTimeout(0);
  page.goto('https://www.google.com/recaptcha/api2/demo');

  await solve(page);
  await recorder.stop();
  // await browser.close();
}

console.log('`ctrl + c` to exit');
process.on('SIGINT', () => {
  console.log('bye!');
  process.exit();
});

run();
