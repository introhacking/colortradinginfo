const express = require('express');
const { exportDataFromScrubing } = require('../../controller/scrubbingController/capScrubing');
const scrubbingRouter = express.Router();

scrubbingRouter.get('/exports-data', exportDataFromScrubing)


module.exports = scrubbingRouter
