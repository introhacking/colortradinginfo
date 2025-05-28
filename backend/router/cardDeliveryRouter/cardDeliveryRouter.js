const express = require('express');
const { getDeliveryStats, getFundData } = require('../../controller/cardDeliveryController/cardDeliveryController');
const router = express.Router();

router.get('/delivery/cards', getDeliveryStats);
router.get('/fetch-data', getFundData);

module.exports = router;
