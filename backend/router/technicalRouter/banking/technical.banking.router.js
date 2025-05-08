const express = require('express');
const { upload } = require('../../../middleware/fileUpload');
const { callImportTechinalBankDataToCreateTable, getAllTechnicalBankData, deleteTechnicalBankById_SG, deleteOrTruncateTable } = require('../../../controller/techicalController/banking/technical.Banking.Controller');
const technicalBankingRouter = express.Router();

technicalBankingRouter.post('/techBankingCSVFile_SG', upload.single('techBankingCSVFile_SG'), callImportTechinalBankDataToCreateTable)

technicalBankingRouter.get('/technical-banking_sale_growth', getAllTechnicalBankData)
technicalBankingRouter.delete('/technical-banking_sale_growth/:_id', deleteTechnicalBankById_SG)


// TRUNCATE TABLE
technicalBankingRouter.post('/technical-banking_sale_growth', deleteOrTruncateTable)

module.exports = technicalBankingRouter