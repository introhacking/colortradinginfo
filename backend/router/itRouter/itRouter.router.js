const express = require('express');
const { createITDetails, getITDetails, updateITCell, getDescriptionByItNameAndItType } = require('../../controller/itController/itController');
const router = express.Router()

router.get('/itCreate' , getITDetails);
router.post('/itCreate' , createITDetails);
router.put('/itCreate' , updateITCell);
router.get('/itq', getDescriptionByItNameAndItType);

module.exports = router
