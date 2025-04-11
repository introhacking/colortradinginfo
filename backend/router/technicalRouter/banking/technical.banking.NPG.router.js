const express = require('express');
const { upload } = require('../../../middleware/fileUpload');
const { getAllTechnicalBankData_NPG, deleteTechnicalBankById_NPG, techicalBankDataToCreateTable_NPG, deleteOrTruncateTable } = require('../../../controller/techicalController/banking/technical.Banking.NPG.Controller');
const technicalBankingNPGRouter = express.Router();

technicalBankingNPGRouter.post('/techBankingCSVFile_NPG', upload.single('techBankingCSVFile_NPG'), techicalBankDataToCreateTable_NPG)

technicalBankingNPGRouter.get('/technical-banking_npg', getAllTechnicalBankData_NPG)
technicalBankingNPGRouter.delete('/technical-banking_npg/:_id', deleteTechnicalBankById_NPG)


// TRUNCATE TABLE
technicalBankingNPGRouter.post('/technical-banking_npg', deleteOrTruncateTable)

module.exports = technicalBankingNPGRouter