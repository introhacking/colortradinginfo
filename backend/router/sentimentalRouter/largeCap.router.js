const { insertLargeCapStocksInBulk, getLargeCapStock, deleteOrTruncateTable, updatingLargeCapStockById, deleteLargeCapStockById, getMergeCSVFileBasedUponCaps } = require('../../controller/sentimentalController/largeCapController')
const { upload } = require('../../middleware/fileUpload')


const LargerCapRouter = require('express').Router() 
// POST
// LargerCapRouter.post('/excelRead', upload.single('excelSheet'), getAllQuotation)
LargerCapRouter.post('/large_excelRead', upload.single('excelSheet'),  insertLargeCapStocksInBulk)
LargerCapRouter.get('/large-cap', getLargeCapStock)
LargerCapRouter.put('/large-cap/:_id', updatingLargeCapStockById)
LargerCapRouter.get('/cap', getMergeCSVFileBasedUponCaps)
//DELETE
LargerCapRouter.delete('/large-cap/:_id', deleteLargeCapStockById)
    
// TRUNCATE TABLE
LargerCapRouter.post('/large_cap', deleteOrTruncateTable)
module.exports = LargerCapRouter