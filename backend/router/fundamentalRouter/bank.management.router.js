const express = require('express');
const { createBankingManagementName, getBankingManagementDetails } = require('../../controller/fundamentals/bank.management.controller');
const router = express.Router();


router.post('/bankmanagement', createBankingManagementName);
router.get('/bankmanagement', getBankingManagementDetails);

module.exports = router;