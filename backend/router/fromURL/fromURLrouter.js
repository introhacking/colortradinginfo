const express = require('express');
// const readerFileService = require('../../services/fileReadingServices');
const { getDataFromURL, getDataFromURL2, getDataFromURL2Data } = require('../../controller/fromURLController/fromURLController');
const router = express.Router();
// Define route to fetch CSV from URL
router.get('/fetch-url', getDataFromURL);

// Define route to fetch CSV from URL2
router.get('/fetch-url-data', getDataFromURL2);



// Define route to fetch CSV from URL2
router.get('/read-csv-data', getDataFromURL2Data);
module.exports = router;
