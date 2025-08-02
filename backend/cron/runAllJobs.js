const { dailyFetchFileJob, monthlyScrapingJob, everyMinuteResearchJob, } = require('./fetchJob');

const today = new Date();

console.log(today)

(async () => {
    console.log("🚀 Triggering scheduled jobs via GitHub Actions");

    // Always run daily job
    await dailyFetchFileJob();

    // Run monthly job only on 17th
    if (today.getDate() === 2) {
        await monthlyScrapingJob();
    }

    // 👇 Skip frequent job for GitHub Actions to avoid overuse
    // await everyMinuteResearchJob();

    console.log("✅ All jobs completed");
})();