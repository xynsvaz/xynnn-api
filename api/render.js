const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

module.exports = async function(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    let browser = null;
    try {
        const { html, width, height } = req.body;

        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();
        await page.setViewport({ width: width || 375, height: height || 667, deviceScaleFactor: 2 });

        // Batasi waktu loading HTML maksimal 8 detik
        await page.setContent(html, { waitUntil: 'load', timeout: 8000 });

        const element = await page.$('.device-screen');
        const buffer = await element.screenshot();

        res.setHeader('Content-Type', 'image/png');
        res.send(buffer);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error rendering image');
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }
};
