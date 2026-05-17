const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3000;

// Limit diperbesar agar bisa menerima HTML dengan base64 gambar profil
app.use(express.json({ limit: '50mb' }));

app.post('/api/render', async (req, res) => {
    let browser = null;
    try {
        const { html, width = 375, height = 667 } = req.body;

        if (!html) {
            return res.status(400).json({ error: 'Data HTML tidak ditemukan' });
        }

        // Jalankan browser (path-nya akan otomatis dibaca dari Docker)
        browser = await puppeteer.launch({
            headless: true,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        
        await page.setViewport({ width: parseInt(width), height: parseInt(height) });
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const screenshot = await page.screenshot({ type: 'png' });
        await browser.close();

        res.setHeader('Content-Type', 'image/png');
        res.send(screenshot);

    } catch (error) {
        console.error('[ KOYEB RENDER ERROR ]:', error);
        if (browser !== null) await browser.close().catch(() => {});
        res.status(500).json({ error: error.message });
    }
});

// Endpoint untuk cek status API aktif atau tidak
app.get('/', (req, res) => res.send('API Render Xynnn Aktif di Koyeb!'));

app.listen(port, () => console.log(`API berjalan di port ${port}`));
