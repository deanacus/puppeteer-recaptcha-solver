const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const solve = require('./solver.js');

const recorderConfig = {
  followNewTab: true,
  fps: 25,
};
const savePath = `./demo-cod-${new Date().toISOString()}.mp4`;

async function run() {
  puppeteer.use(pluginStealth());

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--window-size=360,500',
      '--window-position=000,000',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=site-per-process',
      '--disable-features=IsolateOrigins',
      '--disable-site-isolation-trials',
    ],
    ignoreDefaultArgs: ['--disable-web-security'],
  });

  const page = await browser.newPage();
  const recorder = new PuppeteerScreenRecorder(page, recorderConfig);
  await recorder.start(savePath);

  await page.setDefaultNavigationTimeout(0);
  await page.goto('https://profile.callofduty.com/cod/login', {
    waitUntil: 'networkidle2',
  });

  try {
    await solve(page);
    await recorder.stop();
    await browser.close();
  } catch (error) {
    await recorder.stop();
    await browser.close();
  }
}

console.log('`ctrl + c` to exit');
process.on('SIGINT', () => {
  console.log('bye!');
  process.exit();
});

run();
