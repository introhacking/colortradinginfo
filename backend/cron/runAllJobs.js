const {
  dailyFetchFileJob,
  monthlyScrapingJob,
  everyMinuteResearchJob,
} = require('./fetchJob');

// const today = new Date();

// 🕒 Get IST date safely
function getISTDate() {
  // Convert current UTC time → IST string → back to Date object
  const now = new Date();
  const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  return new Date(istString);
}

(async () => {
  console.log("🚀 Triggering scheduled jobs via GitHub Actions");

  await dailyFetchFileJob();

  // Get IST-based date
  const todayIST = getISTDate();
  console.log("🕒 Current IST:", todayIST.toString());

  // Run monthly job only on 17th IST
  if (todayIST.getDate() === 17) {
    console.log("📅 It's the 17th (IST) — running monthly job...");
    await monthlyScrapingJob(todayIST); // Pass date for testing if needed
  } else {
    console.log("📅 Skipping monthly job — today is not the 17th (IST).");
  }

  // Skip frequent job in GitHub Actions
  // await everyMinuteResearchJob();

  console.log("✅ All jobs completed");
  process.exit(0);
})();
