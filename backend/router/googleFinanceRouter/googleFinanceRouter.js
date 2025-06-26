const express = require('express')
const { getNSEPrice, getNSELiveData, addLiveNSEStockName, deleteStockFromLiveDataCSV } = require('../../controller/googleFinance/googleFinance')
const googleRouter = express.Router();

googleRouter.get('/google-finanace', getNSEPrice)
//  [ POST ]
googleRouter.post('/add-live-stock', addLiveNSEStockName)
googleRouter.get('/google-finanace-live-data', getNSELiveData)
//  [ DELETE ]
googleRouter.delete('/live-data-delete/:stockName', deleteStockFromLiveDataCSV)

module.exports = googleRouter