const express = require('express');
const { upload } = require('../../../middleware/fileUpload');
const { OPGCallTechicalBankDataToCreateTable, OPGGetAllTechnicalBankData, deleteTechnicalBankById_OPG, deleteOrTruncateTable } = require('../../../controller/techicalController/banking/technical.bankingOPG.Controller');
const technicalBankingOPGRouter = express.Router();

technicalBankingOPGRouter.post('/techBankingCSVFile_OPG', upload.single('techBankingCSVFile_OPG'), OPGCallTechicalBankDataToCreateTable)

technicalBankingOPGRouter.get('/technical-banking_opg', OPGGetAllTechnicalBankData)
technicalBankingOPGRouter.delete('/technical-banking_opg/:_id', deleteTechnicalBankById_OPG)

// TRUNCATE TABLE
technicalBankingOPGRouter.post('/technical-banking_opg', deleteOrTruncateTable)

module.exports = technicalBankingOPGRouter