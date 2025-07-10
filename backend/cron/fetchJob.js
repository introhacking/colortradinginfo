const cron = require('node-cron');
// const axios = require('axios');
const readerFileService = require('../services/fileReadingServices');
const { io } = require('../colorInfo');
const yahooFinance = require('yahoo-finance2').default;
const researchModel = require('../model/research/reSearchModel');


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


// [ Research ]
const approxLTE = (a, b, tol = 0.01) => a <= b || Math.abs(a - b) < tol;
const approxGTE = (a, b, tol = 0.01) => a >= b || Math.abs(a - b) < tol;

cron.schedule('* * * * * ', async () => {
    // console.log("🔄 Running research data updater...");

    const allItems = await researchModel.find({
        isTargetHit: { $ne: true }
    });

    if (!allItems || allItems.length === 0) {
        console.log("📉 No active research items left to update.");
        return; // exit early
    }

    for (let item of allItems) {
        try {
            const symbol = item.stockName;
            const quote = await yahooFinance.quote(`${symbol}.NS`);

            const currentMarketPrice = quote?.regularMarketPrice ?? 0;
            // const marketChange = quote?.regularMarketChange ?? 0;
            const marketLow = quote?.regularMarketDayLow ?? 0;

            const isTriggered = approxLTE(item.trigger_price, currentMarketPrice);
            // const isAtRisk = approxGTE(item.stop_loss, item.trigger_price);
            const isAtRisk = approxLTE(currentMarketPrice, item.stop_loss);
            const isTargetHit = approxLTE(item.target_price, currentMarketPrice);

            // await researchModel.findByIdAndUpdate(item._id, {
            //     isTriggered,
            //     isAtRisk,
            //     isTargetHit
            // });

            const updatedResearchStock = await researchModel.findByIdAndUpdate(
                item._id,
                { isTriggered, isAtRisk, isTargetHit },
                { new: true }  // returns the updated document
            );

            // Only emit selected fields
            const payload = {
                _id: updatedResearchStock._id,
                stockName: updatedResearchStock.stockName,
                currentMarketPrice: currentMarketPrice,
                isTriggered: updatedResearchStock.isTriggered,
                // isAtRisk: updatedResearchStock.isAtRisk,
                isAtRisk,
                isTargetHit: updatedResearchStock.isTargetHit,
            };

            // 🔁 Emit the update to all clients
            io.emit('researchStockUpdate', payload);

            // io.emit('researchStockUpdate', {
            //     id: item._id,
            //     stockName: symbol,
            //     currentMarketPrice,
            //     isTriggered,
            //     isAtRisk,
            //     isTargetHit
            // });

        } catch (err) {
            console.error(`❌ Failed for ${item.stockName}:`, err.message);
        }
    }

    // console.log("✅ Research data update completed.");
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



