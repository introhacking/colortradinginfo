const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SMALLCAP = [
    'https://trendlyne.com/mutual-fund/nav/138033/bank-of-india-small-cap-fund-direct-growth/',
    'https://trendlyne.com/mutual-fund/nav/10906/nippon-india-small-cap-fund-direct-plan-growth-plan/',
    'https://trendlyne.com/mutual-fund/nav/137666/invesco-india-smallcap-fund-direct-growth/',
    'https://trendlyne.com/mutual-fund/nav/137723/tata-small-cap-fund-direct-growth/',
    'https://trendlyne.com/mutual-fund/nav/6125/quant-small-cap-fund-growth-option-direct-plan/',
    'https://trendlyne.com/mutual-fund/nav/134856/lic-mf-small-cap-fund-direct-growth/',
    'https://trendlyne.com/mutual-fund/nav/138341/edelweiss-small-cap-fund-direct-growth/',
    'https://trendlyne.com/mutual-fund/nav/189266/bandhan-small-cap-fund-direct-growth/',
    'https://trendlyne.com/mutual-fund/nav/138297/canara-robeco-small-cap-fund-regular-growth/',
    'https://trendlyne.com/mutual-fund/nav/8298/franklin-india-smaller-companies-fund-direct-growth/',
    'https://trendlyne.com/mutual-fund/nav/20566/hsbc-small-cap-fund-fund-direct-growth/',
    'https://trendlyne.com/mutual-fund/nav/7995/kotak-small-cap-direct-growth/',
    'https://trendlyne.com/mutual-fund/nav/17696/axis-small-cap-fund-direct-growth/',
    'https://trendlyne.com/mutual-fund/nav/17800/sbi-small-cap-fund-regular-plan-growth/',
    'https://trendlyne.com/mutual-fund/nav/10901/nippon-india-small-cap-fund-growth/',
    'https://trendlyne.com/mutual-fund/nav/182450/iti-small-cap-fund-direct-growth/',
    'https://trendlyne.com/mutual-fund/nav/356902/uti-small-cap-fund-direct-growth/',
    'https://trendlyne.com/mutual-fund/nav/9129/icici-prudential-smallcap-fund-direct-plan-growth/',
    'https://trendlyne.com/mutual-fund/nav/8801/dsp-small-cap-fund-regular-plan-growth/',
    'https://trendlyne.com/mutual-fund/nav/1146982/mahindra-manulife-small-cap-fund-direct-growth/',
];
const MIDCAP = [
    'https://trendlyne.com/mutual-fund/nav/135331/mahindra-manulife-mid-cap-fund-regular-growth/',
    'https://trendlyne.com/mutual-fund/nav/9311/edelweiss-mid-cap-fund-direct-plan-growth-option/',
    'https://trendlyne.com/mutual-fund/nav/8665/invesco-india-mid-cap-fund-direct-plan-growth-option/',
    'https://trendlyne.com/mutual-fund/nav/6759/quant-mid-cap-fund-growth/',
    'https://trendlyne.com/mutual-fund/nav/18899/motilal-oswal-midcap-direct-growth/',
    'https://trendlyne.com/mutual-fund/nav/8750/hdfc-mid-cap-opportunities-fund-direct-plan-growth-option/',
    'https://trendlyne.com/mutual-fund/nav/11108/baroda-bnp-paribas-mid-cap-fund-direct-plan-growth-option/',
    'https://trendlyne.com/mutual-fund/nav/14416/tata-mid-cap-growth-fund-direct-plan-growth/',
    'https://trendlyne.com/mutual-fund/nav/10643/hsbc-midcap-fund-growth/',
    'https://trendlyne.com/mutual-fund/nav/8044/sbi-magnum-midcap-fund-direct-growth/',
    'https://trendlyne.com/mutual-fund/nav/11349/axis-midcap-fund-direct-plan-growth/',
    'https://trendlyne.com/mutual-fund/nav/6337/nippon-india-growth-fund-growth/',
    'https://trendlyne.com/mutual-fund/nav/8582/kotak-emerging-equity-scheme-direct-growth/',
    'https://trendlyne.com/mutual-fund/nav/424603/iti-mid-cap-fund-direct-growth/',
    'https://trendlyne.com/mutual-fund/nav/189785/union-midcap-fund-direct-growth/',
    'https://trendlyne.com/mutual-fund/nav/7923/icici-prudential-midcap-fund-direct-plan-growth/',
    'https://trendlyne.com/mutual-fund/nav/17663/pgim-india-midcap-opportunities-fund-direct-growth/',
    'https://trendlyne.com/mutual-fund/nav/6421/franklin-india-prima-fund-growth/',
    'https://trendlyne.com/mutual-fund/nav/6372/taurus-discovery-midcap-fund-direct-plan-growth-option/',
    'https://trendlyne.com/mutual-fund/nav/156995/mirae-asset-midcap-fund-regular-growth/'
];
const LARGECAP = [
    'https://trendlyne.com/mutual-fund/nav/6131/jm-large-cap-fund-direct-growth/',
    'https://trendlyne.com/mutual-fund/nav/138541/mahindra-manulife-large-cap-fund-direct-growth/',
    'https://trendlyne.com/mutual-fund/nav/10206/edelweiss-large-cap-fund-direct-plan-growth-option/',
    'https://trendlyne.com/mutual-fund/nav/10368/invesco-india-largecap-fund-direct-plan-growth/',
    'https://trendlyne.com/mutual-fund/nav/11078/baroda-bnp-paribas-large-cap-fund-direct-plan-growth-option/',
    'https://trendlyne.com/mutual-fund/nav/11302/kotak-bluechip-direct-growth/',
    'https://trendlyne.com/mutual-fund/nav/10926/canara-robeco-bluechip-equity-fund-direct-plan-growth/',
    'https://trendlyne.com/mutual-fund/nav/8906/nippon-india-large-cap-fund-direct-plan-growth-plan/',
    'https://trendlyne.com/mutual-fund/nav/9508/icici-prudential-bluechip-fund-growth/',
    'https://trendlyne.com/mutual-fund/nav/8349/sbi-bluechip-fund-direct-growth/',
    'https://trendlyne.com/mutual-fund/nav/541121/bank-of-india-bluechip-fund-direct-growth/',
    'https://trendlyne.com/mutual-fund/nav/358532/iti-large-cap-fund-direct-growth/',
    'https://trendlyne.com/mutual-fund/nav/134712/union-largecap-fund-direct-growth/',
    'https://trendlyne.com/mutual-fund/nav/9713/bandhan-large-cap-fund-direct-plan-growth/',
    'https://trendlyne.com/mutual-fund/nav/14412/tata-large-cap-fund-direct-plan-growth/',
    'https://trendlyne.com/mutual-fund/nav/6550/uti-large-cap-fund-growth-option-direct/',
    'https://trendlyne.com/mutual-fund/nav/8177/aditya-birla-sun-life-frontline-equity-fund-growth/',
    'https://trendlyne.com/mutual-fund/nav/9386/mirae-asset-large-cap-fund-direct-plan-growth/',
    'https://trendlyne.com/mutual-fund/nav/12890/groww-large-cap-fund-direct-plan-growth-option/',
    'https://trendlyne.com/mutual-fund/nav/134711/union-largecap-fund-regular-growth/'
];


// Map cap types to URLs
const CAP_MAP = {
    SMALLCAP,
    MIDCAP,
    LARGECAP
};


// ✅ Ensure directory exists
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// ✅ Export function for one page
const exportFromPage = async (browser, url, downloadPath, attempt = 1) => {
    const MAX_ATTEMPTS = 3;
    let page;

    try {
        page = await browser.newPage();
        await page.setDefaultTimeout(60000);

        // Go to page
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Wait for "Export" button to appear
        await page.waitForSelector('button.mf-button .mf-button-text', { timeout: 30000 });

        // Click "Export"
        await page.evaluate(() => {
            const exportButtons = Array.from(document.querySelectorAll('button.mf-button'));
            const exactExport = exportButtons.find(btn => {
                const spanText = btn.querySelector('.mf-button-text')?.innerText.trim();
                return spanText === 'Export';
            });
            if (exactExport) exactExport.click();
        });

        // Wait for <a download> link with blob
        await page.waitForFunction(() => {
            const a = document.querySelector('a[download]');
            if (!a || !a.href.startsWith('blob:')) return false;
            const name = a.getAttribute('download');
            return name && name !== 'data.csv' && name.trim().length > 4;
        }, { timeout: 60000 });

        // Fetch blob + build filename
        const { base64Data, fileName } = await page.evaluate(async () => {
            const a = document.querySelector('a[download]');
            const response = await fetch(a.href);
            const blob = await response.blob();

            let rawName = a.getAttribute('download');
            let timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            let fileName = rawName && rawName !== 'data.csv'
                ? rawName
                : `export_${timestamp}.csv`;

            // Add month suffix
            const month = new Date().getMonth() + 1;
            fileName = fileName.replace(/\.csv$/, `_${month}.csv`);

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result.split(',')[1];
                    resolve({ base64Data: base64String, fileName });
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        });

        // Save file
        const filePath = path.join(downloadPath, fileName);
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        console.log(`✅ Exported: ${fileName}`);

    } catch (err) {
        console.error(`❌ Error on URL: ${url} (Attempt ${attempt})`, err.message);
        if (attempt < MAX_ATTEMPTS) {
            console.log(`🔁 Retrying (${attempt + 1})...`);
            await exportFromPage(browser, url, downloadPath, attempt + 1);
        } else {
            console.warn(`⚠️ Skipping after ${MAX_ATTEMPTS} failed attempts: ${url}`);
        }
    } finally {
        if (page) await page.close();
    }
};

// ✅ Main controller
exports.exportDataFromScrubing = async (req, res) => {
    const { cap } = req.query;
    const capKey = cap?.toUpperCase();

    const urls = CAP_MAP[capKey];
    if (!urls || !Array.isArray(urls)) {
        return res.status(400).json({ error: 'Invalid cap type. Use SMALLCAP, MIDCAP, or LARGECAP.' });
    }

    const downloadPath = path.resolve(`uploads/scrubbing/${capKey}`);
    ensureDirectoryExists(downloadPath);

    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote',
            '--single-process'
        ],
    });

    try {
        await Promise.all(urls.map(link => exportFromPage(browser, link, downloadPath)));
        res.status(200).send({ status: true, message: `All exports data completed from ${capKey}` });
        console.log('🎉 All exports completed.');
    } catch (e) {
        console.error('🚨 Unexpected failure in batch process:', e.message);
        res.status(500).send({ status: false, error: 'Unexpected error in export process' });
    } finally {
        await browser.close();
    }
};



// function ensureDirectoryExists(dirPath) {
//     if (!fs.existsSync(dirPath)) {
//         fs.mkdirSync(dirPath, { recursive: true });
//     }
// }

// const exportFromPage = async (browser, url, downloadPath, attempt = 1) => {
//     const MAX_ATTEMPTS = 3;
//     let page;

//     try {
//         page = await browser.newPage();
//         await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

//         await page.evaluate(() => {
//             const exportButtons = Array.from(document.querySelectorAll('button.mf-button'));
//             const exactExport = exportButtons.find(btn => {
//                 const spanText = btn.querySelector('.mf-button-text')?.innerText.trim();
//                 return spanText === 'Export';
//             });
//             if (exactExport) exactExport.click();
//         });

//         await page.waitForFunction(() => {
//             const a = document.querySelector('a[download]');
//             if (!a || !a.href.startsWith('blob:')) return false;
//             const name = a.getAttribute('download');
//             return name && name !== 'data.csv' && name.trim().length > 4;
//         }, { timeout: 20000 });

//         // await page.waitForFunction(() => {
//         //     const a = document.querySelector('a[download]');
//         //     return a && a.href.startsWith('blob:');
//         // }, { timeout: 15000 });

//         const { base64Data, fileName } = await page.evaluate(async () => {
//             const a = document.querySelector('a[download]');
//             const response = await fetch(a.href);
//             const blob = await response.blob();

//             let rawName = a.getAttribute('download');
//             let timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//             let fileName = rawName && rawName !== 'data.csv'
//                 ? rawName
//                 : `export_${timestamp}.csv`;


//             // let fileName = a.getAttribute('download') || `export_${Date.now()}.csv`;


//             const month = new Date().getMonth() + 1; // getMonth() is 0-based
//             // // Insert month before .csv
//             fileName = fileName.replace(/\.csv$/, `_${month}.csv`);

//             return new Promise((resolve, reject) => {
//                 const reader = new FileReader();
//                 reader.onloadend = () => {
//                     const base64String = reader.result.split(',')[1];
//                     resolve({ base64Data: base64String, fileName });
//                 };
//                 reader.onerror = reject;
//                 reader.readAsDataURL(blob);
//             });
//         });

//         // const downloadPath = path.resolve(downloadPath);
//         const filePath = path.join(downloadPath, fileName);
//         fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

//         console.log(`✅ Exported: ${fileName}`);
//     } catch (err) {
//         console.error(`❌ Error on URL: ${url} (Attempt ${attempt})`, err.message);
//         if (attempt < MAX_ATTEMPTS) {
//             console.log(`🔁 Retrying (${attempt + 1})...`);
//             await exportFromPage(browser, url, downloadPath, attempt + 1);
//         } else {
//             console.warn(`⚠️ Skipping after ${MAX_ATTEMPTS} failed attempts: ${url}`);
//         }
//     } finally {
//         if (page) await page.close();
//     }
// };

// exports.exportDataFromScrubing = async (req, res) => {
//     const { cap } = req.query

//     // Validate cap type
//     const capKey = cap?.toUpperCase();

//     const urls = CAP_MAP[capKey];
//     // const urls = CAP_MAP[cap?.toUpperCase()];
//     if (!urls || !Array.isArray(urls)) {
//         return res.status(400).json({ error: 'Invalid cap type. Use SMALLCAP, MIDCAP, or LARGECAP.' });
//     }

//     // const downloadPath = path.resolve('./exports');
//     const downloadPath = path.resolve(`uploads/scrubbing/${capKey}`);
//     ensureDirectoryExists(downloadPath);

//     // if (!fs.existsSync(downloadPath)) {
//     //     fs.mkdirSync(downloadPath);
//     // }

//     const browser = await puppeteer.launch({
//         headless: true,
//         args: [
//             '--no-sandbox',
//             '--disable-setuid-sandbox',
//             '--disable-dev-shm-usage',
//             '--disable-gpu',
//             '--no-zygote',
//             '--single-process'
//         ],
//     });

//     try {
//         await Promise.all(urls.map(link => exportFromPage(browser, link, downloadPath)));
//         res.status(200).send({ status: true, message: `All exports data completed from ${capKey}` })
//         console.log('🎉 All exports completed.');
//     } catch (e) {
//         console.error('🚨 Unexpected failure in batch process:', e.message);
//     } finally {
//         await browser.close();
//     }
// };
