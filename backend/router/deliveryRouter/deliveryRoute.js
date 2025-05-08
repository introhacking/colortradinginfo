const express = require('express');
const { upload } = require('../../middleware/fileUpload');
const { insertLDeliveryStockInBulk, getDeliveryStock, deleteOrTruncateTable, deleteDeliveryById, updateDeliveryById } = require('../../controller/deliveryController/deliveryCtrl');
const deliveryRouter = express.Router();


deliveryRouter.post('/deliveryCSVFile', upload.single('deliveryCSVFile'), insertLDeliveryStockInBulk)

deliveryRouter.get('/delivery', getDeliveryStock)
deliveryRouter.delete('/delivery/:_id', deleteDeliveryById)
deliveryRouter.put('/delivery/:_id', updateDeliveryById)




// TRUNCATE TABLE
deliveryRouter.post('/delivery_table', deleteOrTruncateTable)


module.exports = deliveryRouter