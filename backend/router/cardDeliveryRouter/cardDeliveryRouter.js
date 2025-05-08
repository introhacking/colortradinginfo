const express = require('express');
const { getDeliveryStats } = require('../../controller/cardDeliveryController/cardDeliveryController');
const router = express.Router();

router.get('/delivery/cards', getDeliveryStats);

module.exports = router;
