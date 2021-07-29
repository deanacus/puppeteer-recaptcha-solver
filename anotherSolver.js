const https = require('https');
const axios = require('axios');
const Logger = require('./utils/logger');

const log = new Logger({ logLevel: 'critical' });

const TWO_DAYS_IN_MILLISECONDS = 172800000;

const twoDaysAgo = () => {
  const date = new Date(Date.now() - TWO_DAYS_IN_MILLISECONDS);
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  return `${y}${m}${d}`;
};

function rdn(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

const solve = (page) =>
  new Promise(async (resolve, reject) => {
    const getFrameByUrl = async (url, context = page) => {
      try {
        await context.waitForSelector('iframe[src*="' + url + '"]');
        const foundFrame = context
          .frames()
          .find((frame) => frame.url().includes(url));
        return foundFrame;
      } catch (error) {
        log.critical(error);
        throw error;
      }
    };

    try {
      log.info('Finding the parent');
      const recaptchaFrame = await getFrameByUrl('api2/anchor');

      log.info('Start listening for success');
      recaptchaFrame
        .waitForSelector('#recaptcha-anchor[aria-checked="true"]')
        .then(async (i) => {
          log.info('We are successful');
          resolve(
            await await (
              await page.$('#g-recaptcha-response')
            ).getProperty('value'),
          );
        })
        .catch((error) => {
          log.critical(error);
          throw error;
        });

      log.info('Finding checkbox');
      const checkbox = await recaptchaFrame.$('#recaptcha-anchor');
      await checkbox.click({
        delay: rdn(30, 150),
      });

      log.info('Finding image frame');
      const imageFrame = await getFrameByUrl('api2/bframe');
      await imageFrame.waitForFunction(() => {
        const img = document.querySelector('.rc-image-tile-wrapper img');
        return img && img.complete;
      });

      log.info('Finding audio button');
      const audioButton = await imageFrame.$('#recaptcha-audio-button');
      await audioButton.click({
        delay: rdn(30, 150),
      });

      const httsAgent = new https.Agent({
        rejectUnauthorized: false,
      });
      const apiOptions = {
        httsAgent,
        method: 'post',
        url: `https://api.wit.ai/speech?v=${twoDaysAgo()}`,
        headers: {
          Authorization: `Bearer BJ6GUEOB2MPSPCR5FR3QM6JKIIVHILKC`,
          'Content-Type': 'audio/mpeg3',
        },
      };

      //TODO check if it gives us a mean error
      log.info('Finding the audioLink');
      const audioLinkSelector = '.rc-audiochallenge-tdownload-link';
      await imageFrame.waitForSelector(audioLinkSelector);

      log.info('Getting the audio URL');
      const audioLink = await (
        await (await imageFrame.$(audioLinkSelector)).getProperty('href')
      ).jsonValue();

      log.info('Converting audio to buffer');
      const audioBytes = await imageFrame.evaluate((audioLink) => {
        return (async () => {
          const response = await window.fetch(audioLink);
          const buffer = await response.arrayBuffer();
          return Array.from(new Uint8Array(buffer));
        })();
      }, audioLink);

      log.info('Submitting API request');
      const response = await axios({
        ...apiOptions,
        data: new Uint8Array(audioBytes).buffer,
      });

      log.debug(JSON.stringify(response.data, null, 2));

      log.info('Parsing the response');
      const audioTranscript = response.data.text.trim();

      log.info('Finding the response input');
      const input = await imageFrame.$('#audio-response');

      log.info('Clicking the response input');
      await input.click({
        delay: rdn(30, 150),
      });

      log.info('Typing in the response input');
      await input.type(audioTranscript, {
        delay: rdn(30, 75),
      });

      log.info('Finding the submit button');
      const verifyButton = await imageFrame.$('#recaptcha-verify-button');

      log.info('Clicking the submit button');
      await verifyButton.click({
        delay: rdn(30, 150),
      });

      log.info('Checking for success');
      await recaptchaFrame.waitForSelector(
        '#recaptcha-anchor[aria-checked="true"]',
      );
    } catch (e) {
      log.critical(e);
      return '';
    }
  });

module.exports = {
  solve,
  rdn,
};
