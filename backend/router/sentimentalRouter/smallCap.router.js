const { insertSmallCapStocksInBulk, getSmallCapStock, deleteOrTruncateTable, updatingSmallCapStockById, deleteSmallCapStockById, mergeCSVFile_SmallCap } = require('../../controller/sentimentalController/smallCapController')
const { upload } = require('../../middleware/fileUpload')


const sentimentRouter = require('express').Router()
// POST
// sentimentRouter.post('/excelRead', upload.single('excelSheet'), getAllQuotation)
sentimentRouter.post('/small_excelRead', upload.single('small_ExcelSheet'), insertSmallCapStocksInBulk)
sentimentRouter.get('/small-cap', getSmallCapStock)
sentimentRouter.put('/small-cap/:_id', updatingSmallCapStockById)
// DELETE
sentimentRouter.delete('/small-cap/:_id', deleteSmallCapStockById)

// TRUNCATE TABLE
sentimentRouter.post('/small_cap', deleteOrTruncateTable)

// ======================================================================================= //
// ---------------------------------- [ MERGING CSV FILES ] ------------------------- //

sentimentRouter.get('/cap-file', mergeCSVFile_SmallCap)

module.exports = sentimentRouter