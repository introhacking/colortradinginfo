const trackingModel = require('../../model/tracking/tracking.model');
const authUserModel = require('../../model/authLogin/authLogin')

const yahooFinance = require('yahoo-finance2').default;

yahooFinance.suppressNotices(['yahooSurvey']);

exports.getUserTrackingList = async (req, res) => {
    try {
        const { userId } = req.params; // or get from req.user after auth
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        // ✅ Find tracking list for this user
        const trackingData = await trackingModel.findOne({ userId: userId });
        if (!trackingData || trackingData.trackingList.length === 0) {
            return res.status(404).json({ error: "No tracking list found" });
        }

        // ✅ Collect all stock names with `.NS` suffix
        const symbols = trackingData.trackingList.map((item) => `${item.stockName}.NS`);

        // ✅ Fetch live quotes in one batch
        const quotes = await yahooFinance.quote(symbols);

        // ✅ Merge tracking list with live data
        const mergedList = trackingData.trackingList.map((item) => {
            const quote = quotes.find((q) => q.symbol === `${item.stockName}.NS`);
            const currentPrice = quote?.regularMarketPrice || null;
            return {
                ...item.toObject?.() ?? item,
                cmp: currentPrice
                // quote: quote || { error: "Quote not available" },
            };
        });

        return res.status(200).json({
            success: true,
            trackingList: mergedList,
        });
    } catch (err) {
        console.error("Server error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


exports.addTrackingStock = async (req, res) => {
    try {
        const { userId, stockName } = req.body;

        if (!userId || !stockName) {
            return res.status(400).json({ error: "userId and stockName are required" });
        }

        // Get username from Auth model
        const user = await authUserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Find by userId instead of _id
        let userTracking = await trackingModel.findOne({ userId });

        if (!userTracking) {
            userTracking = new trackingModel({
                username: user.username,
                userId,
                trackingList: [{ stockName }]
            });
        } else {
            // Check duplicate correctly
            if (userTracking.trackingList.some(item => item.stockName === stockName)) {
                return res.status(400).json({ error: "Stock already in tracking list" });
            }
            userTracking.trackingList.push({ stockName });
        }

        await userTracking.save();
        return res.status(200).json({ success: true, data: `${stockName} added succesfully in track` });

    } catch (err) {
        console.error("Error in addTrackingStock:", err);
        return res.status(500).json({ error: "Server error" });
    }
};


// Remove tracking item
// Remove stock from tracking list
exports.removeTrackingStock = async (req, res) => {
    try {
        const { stockId } = req.params; // subdocument _id

        // Use $pull to remove subdocument by its _id
        const updatedTracking = await trackingModel.findOneAndUpdate(
            { "trackingList._id": stockId },   // filter
            { $pull: { trackingList: { _id: stockId } } },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Stock removed successfully",
            // data: updatedTracking
        });

    } catch (err) {
        console.error("Error in removeTrackingStock:", err);
        return res.status(500).json({ error: "Server error" });
    }
};
