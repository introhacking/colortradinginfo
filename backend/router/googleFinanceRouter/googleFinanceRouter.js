const express = require('express')
const { getNSEPrice } = require('../../controller/googleFinance/googleFinance')
const googleRouter = express.Router();

googleRouter.get('/google-finanace', getNSEPrice)

module.exports = googleRouter