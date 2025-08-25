const express = require("express");
const router = express.Router();
const { addTrackingStock, getUserTrackingList, removeTrackingStock } = require("../../controller/tracking/tracking.Ctrl");

// Add stock to tracking list
router.post("/tracking/add", addTrackingStock);

// Get tracking list with Yahoo data
router.get("/tracking/:userId", getUserTrackingList);

router.delete("/tracking/remove/:stockId", removeTrackingStock);

module.exports = router;
