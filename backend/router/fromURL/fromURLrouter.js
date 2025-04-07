const express = require('express');
// const readerFileService = require('../../services/fileReadingServices');
const { getDataFromURL } = require('../../controller/fromURLController/fromURLController');
const router = express.Router();
// Define route to fetch CSV from URL
router.get('/fetch-url', getDataFromURL);
module.exports = router;
