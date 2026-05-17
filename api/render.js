import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export default async function handler(req, res) {
    // 1. Validasi Method Request (Hanya menerima POST dari Bot Xynnn)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Gunakan POST.' });
    }

    let browser = null;

    try {
        // 2. Ambil data HTML dan ukuran layar dari body
        const { html, width = 375, height = 667 } = req.body;

        if (!html) {
            return res.status(400).json({ error: 'Data HTML tidak ditemukan di request body.' });
        }

        // Opsional: Atur grafis untuk performa Vercel yang lebih stabil di Node 20
        chromium.setGraphicsMode = false;

        // 3. Buka Browser Headless khusus serverless Vercel
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();

        // 4. Set ukuran viewport agar pas dengan tampilan Fake Chat iOS
        await page.setViewport({ 
            width: parseInt(width), 
            height: parseInt(height) 
        });

        // 5. Render HTML
        // 'networkidle0' memastikan Vercel menunggu semua gambar (profil WA) dan font termuat penuh
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // 6. Ambil screenshot dalam format PNG
        const screenshot = await page.screenshot({ type: 'png' });

        // 7. Tutup browser dengan aman
        await browser.close();

        // 8. Kirim buffer gambar ke Bot
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 's-maxage=31536000, stale-while-revalidate');
        res.send(screenshot);

    } catch (error) {
        console.error('[ VERCEL RENDER ERROR ]:', error);
        
        // Pastikan browser dipaksa tutup jika proses render gagal (mencegah memory leak 500)
        if (browser !== null) {
            await browser.close().catch(() => {});
        }

        // Kembalikan pesan error yang jelas agar mudah dibaca di log Pterodactyl
        res.status(500).json({ 
            error: 'Gagal merender gambar di API Vercel', 
            detail: error.message 
        });
    }
}
