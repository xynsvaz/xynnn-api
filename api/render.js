import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export default async function handler(req, res) {
    // Hanya izinkan bot mengirim data via metode POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { html, width, height } = req.body;

        // Buka browser super ringan khusus serverless Vercel
        const browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();
        
        // Atur ukuran layar sesuai permintaan bot Xynnn (standarnya 375x667 untuk ukuran HP)
        await page.setViewport({ 
            width: width || 375, 
            height: height || 667 
        });

        // Masukkan HTML dari bot ke dalam browser Vercel
        // 'networkidle0' memastikan Vercel menunggu sampai semua font dan foto profil selesai dimuat
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // Jepret layar (screenshot) menjadi gambar PNG
        const screenshot = await page.screenshot({ type: 'png' });
        await browser.close();

        // Kirim hasil gambar kembali ke bot Xynnn
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 's-maxage=31536000, stale-while-revalidate');
        res.send(screenshot);

    } catch (error) {
        console.error('Render error:', error);
        // Jika masih gagal, ini akan memunculkan detail error di log Vercel
        res.status(500).send(`Error rendering image: ${error.message}`);
    }
}
