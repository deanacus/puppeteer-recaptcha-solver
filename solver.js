const axios = require('axios');
const https = require('https');

function rdn(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

async function dumpFrameTree(frame, indent) {
  const name = await frame.title();
  const url = frame.url();
  console.log(indent + `${name}: ${url}`);
  for (const child of frame.childFrames()) {
    await dumpFrameTree(child, indent + '  ');
  }
}

async function solve(page) {
  try {
    // Wait until we have the frame we want
    while (true) {
      console.log('looking for a recaptcha');
      const iframe = await page.waitForFunction(() => {
        const found = document.querySelector('iframe[src*="api2/anchor"]');
        // return !!iframe.contentWindow.document.querySelector('#recaptcha-anchor');
        return found;
      });

      if (iframe) {
        console.log('found recaptcha');
        break;
      }
      console.log('Nothing found');
      page.waitForTimeout(250);
      continue;
    }

    console.log('Getting frames.');
    let frames = await page.frames();

    console.log('Finding recaptcha');
    const recaptchaFrame = frames.find((frame) =>
      frame.url().includes('api2/anchor'),
    );

    console.log('Finding recaptcha checkbox');
    const checkbox = await recaptchaFrame.$('#recaptcha-anchor');

    console.log('Clicking recaptcha checkbox');
    await checkbox.click({ delay: rdn(30, 150) });

    await page.waitForTimeout(750);

    console.log('Just for shits and giggles, lets check if we have succeeded');
    const checkboxNow = await recaptchaFrame.$eval(
      '#recaptcha-anchor',
      (el) => el.outerHTML,
    );
    console.log(checkboxNow);

    // console.log('Checking recaptcha images exist');
    // await recaptchaFrame.$eval('.rc-image-tile-wrapper img', (frame) =>
    //   console.log(frame.innerHTML),
    // );

    await dumpFrameTree(recaptchaFrame, '');
    process.exit();
    console.log('Find the image');
    // we can have 100 tries;
    let tries = 0;
    while (true) {
      try {
        tries++;
        const children = recaptchaFrame.childFrames();

        const found = await recaptchaFrame.$('.rc-image-tile-wrapper img');
        if (!found) {
          throw new Error('');
        }
        break;
      } catch (error) {
        console.warn(`Attempt number ${tries} failed`);
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
    console.log('Found the image');

    console.log('Getting a new frames array');
    frames = await page.frames();

    console.log('Finding recaptcha image iframe');
    const imageFrame = frames.find((frame) =>
      frame.url().includes('api2/bframe'),
    );

    const foundFrames = frames.filter((frame) =>
      frame.url().includes('api2/bframe'),
    );
    console.log(
      `Found ${foundFrames.length} frames with url a url containing 'api2/bframe'`,
    );

    const imgHTML = await imageFrame.$eval('body', (el) => el.outerHTML);
    console.log(imgHTML);

    console.log('Finding audio button');
    const audioButton = await imageFrame.$('#recaptcha-audio-button');

    console.log('Clicking audio button');
    await audioButton.click({ delay: rdn(30, 150) });

    while (true) {
      try {
        console.log('Finding Download link');
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
        console.log('download link not found');
        return null;
      }

      console.log('Getting the src of the audio src');
      const audioLink = await page.evaluate(() => {
        const iframe = document.querySelector('iframe[src*="api2/bframe"]');
        return iframe.contentWindow.document.querySelector('#audio-source').src;
      });

      console.log('Converting audio');
      const audioBytes = await page.evaluate((audioLink) => {
        return (async () => {
          const response = await window.fetch(audioLink);
          const buffer = await response.arrayBuffer();
          return Array.from(new Uint8Array(buffer));
        })();
      }, audioLink);

      console.log('Sending api request');
      const httsAgent = new https.Agent({ rejectUnauthorized: false });
      const response = await axios({
        httsAgent,
        method: 'post',
        url: 'https://api.wit.ai/speech',
        data: new Uint8Array(audioBytes).buffer,
        headers: {
          Authorization: 'Bearer BJ6GUEOB2MPSPCR5FR3QM6JKIIVHILKC',
          'Content-Type': 'audio/mpeg3',
        },
      });

      console.log('Handling an empty response by reloading');
      if (undefined == response.data.text) {
        const reloadButton = await imageFrame.$('#recaptcha-reload-button');
        await reloadButton.click({ delay: rdn(30, 150) });
        continue;
      }

      console.log('Extracting the text from response');
      const audioTranscript = response.data.text.trim();
      console.log('findind the response input field');
      const input = await imageFrame.$('#audio-response');

      console.log('Selecting the input field');
      await input.click({ delay: rdn(30, 150) });

      console.log('Typing the response into the input field');
      await input.type(audioTranscript, { delay: rdn(30, 75) });

      console.log('Finding the submit button');
      const verifyButton = await imageFrame.$('#recaptcha-verify-button');

      console.log('Clicking the submit button');
      await verifyButton.click({ delay: rdn(30, 150) });

      try {
        console.log('Trying to confirm that it worked');
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
        console.log('multiple audio');
        continue;
      }
    }
  } catch (e) {
    console.log(e);
    return null;
  }
}

module.exports = solve;
