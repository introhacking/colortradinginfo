const cron = require('node-cron');
// const axios = require('axios');
const readerFileService = require('../services/fileReadingServices');
const { io } = require('../colorInfo');


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


// Schedule to run at 00:00 on the 16th of every month
cron.schedule('10 10 18 * *', () => {
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    let annoucement = `📢 Scraping all cap (Large, Mid, Small) of ${previousMonth.toLocaleString('default', { month: 'long' })}`;
    // Call your scraping function here
    io.emit('scrape-announcement', annoucement);
    //   scrapeAllCaps(previousMonth);
});

// Temporarily add for testing
// setTimeout(() => {
//     console.log('hello...')
//     io.emit('scrape-announcement', '📢 Test announcement from server');
// }, 5000);

// function scrapeAllCaps(month) {
//   // Your scraping logic
//   console.log(`Running scraping job for ${month.toISOString().slice(0, 7)}...`);
// }






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



