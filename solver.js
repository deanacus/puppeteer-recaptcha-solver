const axios = require('axios');
const https = require('https');
const Logger = require('./logger');

const logger = new Logger({ logLevel: 'critical' });

function rdn(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

async function dumpFrameTree(frame, indent) {
  const name = await frame.title();
  const url = frame.url();
  logger.info(indent + `${name}: ${url}`);
  for (const child of frame.childFrames()) {
    await dumpFrameTree(child, indent + '  ');
  }
}

const TWO_DAYS_IN_MILLISECONDS = 172800000;

const twoDaysAgo = () => {
  const date = new Date(Date.now() - TWO_DAYS_IN_MILLISECONDS);
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  return `${y}${m}${d}`;
};

async function solve(page) {
  try {
    // Wait until we have the frame we want
    while (true) {
      logger.info('looking for a recaptcha');
      const iframe = await page.waitForFunction(() => {
        const found = document.querySelector('iframe[src*="api2/anchor"]');
        // return !!iframe.contentWindow.document.querySelector('#recaptcha-anchor');
        return found;
      });

      if (iframe) {
        logger.info('found recaptcha');
        break;
      }
      logger.error('Nothing found');
      page.waitForTimeout(250);
      continue;
    }

    logger.info('Getting frames.');
    let frames = await page.frames();

    logger.info('Finding recaptcha');
    const recaptchaFrame = frames.find((frame) =>
      frame.url().includes('api2/anchor'),
    );

    logger.info('Finding recaptcha checkbox');
    const checkbox = await recaptchaFrame.$('#recaptcha-anchor');

    logger.info('Clicking recaptcha checkbox');
    await checkbox.click({ delay: rdn(30, 150) });

    await page.waitForTimeout(750);

    logger.info('Just for shits and giggles, lets check if we have succeeded');
    const checkboxNow = await recaptchaFrame.$eval(
      '#recaptcha-anchor',
      (el) => el.outerHTML,
    );
    logger.printMessage(checkboxNow, '');

    // logger.info('Checking recaptcha images exist');
    // await recaptchaFrame.$eval('.rc-image-tile-wrapper img', (frame) =>
    //   logger.info(frame.innerHTML),
    // );
    logger.info('Find the image');
    // we can have 100 tries;
    let tries = 0;
    while (true) {
      try {
        tries++;
        const found = await recaptchaFrame.$('.rc-image-tile-wrapper img');
        if (!found) {
          throw new Error('');
        }
        break;
      } catch (error) {
        logger.warn(`Attempt number ${tries} failed`);
        await page.waitForTimeout(250);
        if (tries > 99) {
          break;
        }
        continue;
      }
    }
    await recaptchaFrame.$eval(
      '.rc-image-tile-wrapper img',
      (img) => img.complete,
    );
    logger.info('Found the image');

    logger.info('Getting a new frames array');
    frames = await page.frames();

    logger.info('Finding recaptcha image iframe');
    const imageFrame = frames.find((frame) =>
      frame.url().includes('api2/bframe'),
    );

    const foundFrames = frames.filter((frame) =>
      frame.url().includes('api2/bframe'),
    );
    logger.info(
      `Found ${foundFrames.length} frames with url a url containing 'api2/bframe'`,
    );

    const imgHTML = await imageFrame.$eval('body', (el) => el.outerHTML);
    logger.info(imgHTML);

    logger.info('Finding audio button');
    const audioButton = await imageFrame.$('#recaptcha-audio-button');

    logger.info('Clicking audio button');
    await audioButton.click({ delay: rdn(30, 150) });

    while (true) {
      try {
        logger.info('Finding Download link');
        await page.waitForFunction(
          () => {
            const iframe = document.querySelector('iframe[src*="api2/bframe"]');
            if (!iframe) return false;

            return !!iframe.contentWindow.document.querySelector(
              '.rc-audiochallenge-tdownload-link',
            );
          },
          { timeout: 1000 },
        );
      } catch (error) {
        logger.error('download link not found');
        return null;
      }

      logger.info('Getting the src of the audio src');
      const audioLink = await page.evaluate(() => {
        const iframe = document.querySelector('iframe[src*="api2/bframe"]');
        return iframe.contentWindow.document.querySelector('#audio-source').src;
      });

      logger.info('Converting audio');
      const audioBytes = await page.evaluate((audioLink) => {
        return (async () => {
          const response = await window.fetch(audioLink);
          const buffer = await response.arrayBuffer();
          return Array.from(new Uint8Array(buffer));
        })();
      }, audioLink);

      logger.info('Sending api request');
      const httsAgent = new https.Agent({ rejectUnauthorized: false });
      const response = await axios({
        httsAgent,
        method: 'post',
        url: `https://api.wit.ai/speech?v=${twoDaysAgo()}`,
        data: new Uint8Array(audioBytes).buffer,
        headers: {
          Authorization: 'Bearer BJ6GUEOB2MPSPCR5FR3QM6JKIIVHILKC',
          'Content-Type': 'audio/mpeg3',
        },
      });

      logger.info('Handling an empty response by reloading');
      if (undefined == response.data.text) {
        const reloadButton = await imageFrame.$('#recaptcha-reload-button');
        await reloadButton.click({ delay: rdn(30, 150) });
        continue;
      }

      logger.info('Extracting the text from response');
      const audioTranscript = response.data.text.trim();
      logger.info('findind the response input field');
      const input = await imageFrame.$('#audio-response');

      logger.info('Selecting the input field');
      await input.click({ delay: rdn(30, 150) });

      logger.info('Typing the response into the input field');
      await input.type(audioTranscript, { delay: rdn(30, 75) });

      logger.info('Finding the submit button');
      const verifyButton = await imageFrame.$('#recaptcha-verify-button');

      logger.info('Clicking the submit button');
      await verifyButton.click({ delay: rdn(30, 150) });

      try {
        logger.info('Trying to confirm that it worked');
        await page.waitForFunction(
          () => {
            const iframe = document.querySelector('iframe[src*="api2/anchor"]');
            if (!iframe) return false;

            return !!iframe.contentWindow.document.querySelector(
              '#recaptcha-anchor[aria-checked="true"]',
            );
          },
          { timeout: 1000 },
        );

        return page.evaluate(
          () => document.getElementById('g-recaptcha-response').value,
        );
      } catch (e) {
        logger.error('multiple audio');
        continue;
      }
    }
  } catch (e) {
    logger.critical(e);
    throw e;
  }
}

module.exports = solve;
