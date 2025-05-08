const express = require('express');
const { createBankingDetails, getBankingDetails, updatingBankDetails, getDescriptionByBankAndManagement, postBankData } = require('../../controller/fundamentals/banking.controller');
const { upload } = require('../../middleware/fileUpload');

const router = express.Router();

router.post('/banking', createBankingDetails);
router.get('/banking', getBankingDetails);
router.put('/banking', updatingBankDetails);
router.get('/q', getDescriptionByBankAndManagement);


//fILE UPLOAD
router.post('/bank/upload', upload.single('bankexcel'), postBankData);
module.exports = router;
