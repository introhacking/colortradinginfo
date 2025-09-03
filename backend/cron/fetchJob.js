const cron = require('node-cron');
// const axios = require('axios');
const readerFileService = require('../services/fileReadingServices');
const { io } = require('../colorInfo');
const yahooFinance = require('yahoo-finance2').default;
const researchModel = require('../model/research/reSearchModel');
const trackingModel = require('../model/tracking/tracking.model');
const { getUserTrackingList } = require('../controller/tracking/tracking.Ctrl');


// exports.dailyFetchFileJob = async () => {
//     cron.schedule('30 11 * * *', async () => {
//         const today = new Date();
//         today.setDate(today.getDate() - 1);
//         const yyyy = today.getFullYear();
//         const mm = String(today.getMonth() + 1).padStart(2, '0');
//         const dd = String(today.getDate()).padStart(2, '0');
//         const dateStr = `${dd}${mm}${yyyy}`;

//         const maxRetries = 3;
//         let attempts = 0;
//         let success = false;

//         while (attempts < maxRetries && !success) {
//             try {
//                 await readerFileService.fetchDataForDates([dateStr]);
//                 console.log(`✅ Data fetched successfully for ${dateStr}`);
//                 success = true;
//             } catch (error) {
//                 attempts++;
//                 console.error(`❌ Attempt ${attempts} failed: ${error.message}`);
//                 if (attempts === maxRetries) {
//                     console.error(`🚨 All ${maxRetries} attempts failed for ${dateStr}`);
//                     // Optional: alertService.sendEmail(...) or log to file
//                 } else {
//                     await new Promise(res => setTimeout(res, 2000)); // wait before retry
//                 }
//             }
//         }
//     }, {
//         timezone: 'Asia/Kolkata'
//     });
// }

exports.dailyFetchFileJob = async () => {
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
};

// exports.monthlyScrapingJob = async () => {
//     // Schedule to run at 00:00 on the 16th of every month
//     cron.schedule('10 10 17 * *', () => {
//         const previousMonth = new Date();
//         previousMonth.setMonth(previousMonth.getMonth() - 1);

//         let annoucement = `📢 Scraping all cap (Large, Mid, Small) of ${previousMonth.toLocaleString('default', { month: 'long' })}`;
//         // Call your scraping function here
//         io.emit('scrape-announcement', annoucement);
//         //   scrapeAllCaps(previousMonth);
//     }, {
//         timezone: 'Asia/Kolkata'
//     });
// }



// exports.monthlyScrapingJob = async () => {
//     const today = new Date();

//     // Only run this on the 17th (optional check for safety)
//     if (today.getDate() !== 19) {
//         console.log("📅 Skipping monthly job — today is not the 17th.");
//         return;
//     }

//     const previousMonth = new Date();
//     previousMonth.setMonth(previousMonth.getMonth() - 1);

//     const monthName = previousMonth.toLocaleString('default', { month: 'long' });

//     let announcement = `📢 Scraping all cap (Large, Mid, Small) of ${monthName}`;

//     console.log(announcement);

//     // If using WebSocket or socket.io:
//     if (typeof io !== 'undefined') {
//         io.emit('scrape-announcement', announcement);
//     }

//     // TODO: Run your scraping logic here
//     // await scrapeAllCaps(previousMonth);

//     console.log("✅ Monthly scraping job completed.");
// };


// fetchJob.js
exports.monthlyScrapingJob = async (date = new Date()) => {
    if (date.getDate() !== 17) {
        console.log("📅 Skipping monthly job — today is not the 17th.");
        return;
    }

    const previousMonth = new Date(date);
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const monthName = previousMonth.toLocaleString('default', { month: 'long' });

    let announcement = `📢 Scraping all cap (Large, Mid, Small) of ${monthName}`;
    console.log(announcement);

    // TODO: Run your scraping logic here
    // await scrapeAllCaps(previousMonth);

    console.log("✅ Monthly scraping job completed.");
};



// [ Research ]
const approxLTE = (a, b, tol = 0.01) => a <= b || Math.abs(a - b) < tol;
const approxGTE = (a, b, tol = 0.01) => a >= b || Math.abs(a - b) < tol;
exports.everyMinuteResearchJob = async () => {
    cron.schedule('* * * * * ', async () => {
        // console.log("🔄 Running research data updater...");

        const allItems = await researchModel.find({
            isTargetHit: { $ne: true }
        });

        if (!allItems || allItems.length === 0) {
            // console.log("📉 No active research items left to update.");
            return; // exit early
        }

        for (let item of allItems) {
            try {
                const symbol = item.stockName;
                const quote = await yahooFinance.quote(`${symbol}.NS`);

                const currentMarketPrice = quote?.regularMarketPrice ?? 0;
                // const marketChange = quote?.regularMarketChange ?? 0;
                const marketLow = quote?.regularMarketDayLow ?? 0;

                // const isTriggered = approxLTE(item.trigger_price, currentMarketPrice);
                // const isAtRisk = approxGTE(item.stop_loss, item.trigger_price);
                const isTriggered = item.isTriggered || approxLTE(item.trigger_price, currentMarketPrice);
                const wasActive = item.wasActive || isTriggered; // persist true once

                const isAtRisk = approxLTE(currentMarketPrice, item.stop_loss);
                const isTargetHit = approxLTE(item.target_price, currentMarketPrice);

                // await researchModel.findByIdAndUpdate(item._id, {
                //     isTriggered,
                //     isAtRisk,
                //     isTargetHit
                // });

                const updatedResearchStock = await researchModel.findByIdAndUpdate(
                    item._id,
                    { isTriggered, isAtRisk, isTargetHit, wasActive },
                    { new: true }  // returns the updated document
                );

                // Only emit selected fields
                const payload = {
                    _id: updatedResearchStock._id,
                    stockName: updatedResearchStock.stockName,
                    currentMarketPrice: currentMarketPrice,
                    isTriggered: updatedResearchStock.isTriggered,
                    wasActive: updatedResearchStock.wasActive,
                    isAtRisk: updatedResearchStock.isAtRisk,
                    // isAtRisk,
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
    }, {
        timezone: 'Asia/Kolkata'
    });
}


// [ TRACKING ]
exports.trackingListsJobEveryMin = async () => {
    cron.schedule('* * * * * ', async () => {
        console.log("🔄 Running Tracking data updater...");

        // ✅ Find tracking list for this user
        const trackingData = await getUserTrackingList()
        console.log(trackingData)
    })
}
