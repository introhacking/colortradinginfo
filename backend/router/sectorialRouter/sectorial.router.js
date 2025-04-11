const express = require('express');
const { uploadMultiImg } = require("../../middleware/fileUpload");
const { createSectorDetails, getSectorialDetails } = require('../../controller/sectorialController/sectorialCtrl');
const sectorialRouter = express.Router();


sectorialRouter.post('/sector', uploadMultiImg.fields([{ name: 'month' }, { name: 'week' }, { name: 'day' }]), createSectorDetails)

sectorialRouter.get('/sector', getSectorialDetails)


module.exports = sectorialRouter