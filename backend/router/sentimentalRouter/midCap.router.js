const { deleteLargeCapStockById } = require('../../controller/sentimentalController/largeCapController')
const { insertMidCapStocksInBulk, getMidCapStock, deleteOrTruncateTable, updatingMidCapStockById, deleteMidCapStockById } = require('../../controller/sentimentalController/midCapController')
const { upload } = require('../../middleware/fileUpload')


const MidCapRouter = require('express').Router()
// POST
// MidCapRouter.post('/excelRead', upload.single('excelSheet'), getAllQuotation)
MidCapRouter.post('/mid_excelRead', upload.single('mid_ExcelSheet'), insertMidCapStocksInBulk)
MidCapRouter.get('/mid-cap', getMidCapStock)
MidCapRouter.put('/mid-cap/:_id', updatingMidCapStockById)
MidCapRouter.delete('/mid-cap/:_id', deleteMidCapStockById)

// TRUNCATE TABLE
MidCapRouter.post('/mid_cap', deleteOrTruncateTable)
module.exports = MidCapRouter