const express = require('express');
const { exportDataFromScrubing, TestingExport } = require('../../controller/scrubbingController/capScrubing');
const scrubbingRouter = express.Router();

scrubbingRouter.get('/exports-data', exportDataFromScrubing)
// scrubbingRouter.get('/exports-data', TestingExport)


module.exports = scrubbingRouter
