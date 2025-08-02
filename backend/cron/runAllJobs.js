const {
  dailyFetchFileJob,
  monthlyScrapingJob,
  everyMinuteResearchJob,
} = require('./fetchJob');

const today = new Date();

(async () => {
  console.log("🚀 Triggering scheduled jobs via GitHub Actions");

  await dailyFetchFileJob();

  if (today.getDate() === 2) {
    await monthlyScrapingJob();
  }

  // Skip frequent job in GitHub Actions
  // await everyMinuteResearchJob();

  console.log("✅ All jobs completed");
})();
