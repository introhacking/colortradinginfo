exports.exportData = async () => {
    const downloadPath = path.resolve('./exports');
    const filePath = path.join(downloadPath, `export_${Date.now()}.csv`);

    if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath);
    }

    // console.log(puppeteer)


    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // console.log("browser: ", browser)

    const page = await browser.newPage();

    // await page.goto('https://trendlyne.com/mutual-fund/nav/134711/union-largecap-fund-regular-growth/', { waitUntil: 'networkidle2' });
    // await page.goto('https://trendlyne.com/mutual-fund/mf-all/?category=Large-Cap&plan=Regular&plan=Direct', { waitUntil: 'networkidle2' });
    // await page.goto('https://trendlyne.com/mutual-fund/mf-all/?category=Liquid&category=10+yr+Government+Bond&plan=Regular&plan=Direct', { waitUntil: 'networkidle2' });
    await page.goto('https://trendlyne.com/mutual-fund/nav/6131/jm-large-cap-fund-direct-growth/', { waitUntil: 'networkidle2' });

    // Click the Export button
    await page.evaluate(() => {

        const exportButtons = Array.from(document.querySelectorAll('button.mf-button'));
        const exactExport = exportButtons.find(btn => {
            const spanText = btn.querySelector('.mf-button-text')?.innerText.trim();
            return spanText === 'Export';
        });

        if (exactExport) exactExport.click();
    });


    // Wait for the download anchor to appear
    await page.waitForFunction(() => {
        const a = document.querySelector('a[download]');
        return a && a.href.startsWith('blob:');
    }, { timeout: 10000 });

    // ✅ Read the blob content as base64 using FileReader
    const { base64Data, fileName } = await page.evaluate(async () => {
        console.log(fileName)
        const a = document.querySelector('a[download]');
        const response = await fetch(a.href);
        const blob = await response.blob();
        const fileName = a.getAttribute('download') || `export_${Date.now()}.csv`;

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(',')[1]; // remove data:*/*;base64,
                resolve({ base64Data: base64String, fileName });
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    });

    // Write to file
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);

    await browser.close();
};