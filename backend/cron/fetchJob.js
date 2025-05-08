const cron = require('node-cron');
// const axios = require('axios');
const readerFileService = require('../services/fileReadingServices');


cron.schedule('35 10 * * *', async () => {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${dd}${mm}${yyyy}`;

    const maxRetries = 3;
    let attempts = 0;
    let success = false;

    while (attempts < maxRetries && !success) {
        try {
            await readerFileService.fetchDataForDates([dateStr]);
            console.log(`✅ Data fetched successfully for ${dateStr}`);
            success = true;
        } catch (error) {
            attempts++;
            console.error(`❌ Attempt ${attempts} failed: ${error.message}`);
            if (attempts === maxRetries) {
                console.error(`🚨 All ${maxRetries} attempts failed for ${dateStr}`);
                // Optional: alertService.sendEmail(...) or log to file
            } else {
                await new Promise(res => setTimeout(res, 2000)); // wait before retry
            }
        }
    }
});


// cron.schedule('38 10 * * *', async () => {
//     const today = new Date();
//     today.setDate(today.getDate() - 1);

//     const yyyy = today.getFullYear();
//     const mm = String(today.getMonth() + 1).padStart(2, '0');
//     const dd = String(today.getDate()).padStart(2, '0');
//     const dateStr = `${dd}${mm}${yyyy}`;

//     try {
//         await readerFileService.fetchDataForDates([dateStr]);
//         // const result = await readerFileService.fetchDataForDates([dateStr]);
//         // console.log(`🕰️ Cron ran for ${dateStr}:`, result);
//     } catch (error) {
//         console.error(`❌ Cron error for ${dateStr}:`, error.message);
//     }
// });

