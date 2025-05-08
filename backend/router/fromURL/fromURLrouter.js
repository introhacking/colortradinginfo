const express = require('express');
// const readerFileService = require('../../services/fileReadingServices');
const { getDataFromURL, getDataFromURL2, getDataFromURL2Data, getDataBasedUponDateRequest } = require('../../controller/fromURLController/fromURLController');
const router = express.Router();
// Define route to fetch CSV from URL
router.get('/fetch-url', getDataFromURL);

// Define route to fetch CSV from URL2
router.get('/csv/fetch-url-data', getDataFromURL2);



// Define route to fetch CSV from URL2
router.get('/read-csv-data', getDataFromURL2Data);


// Define route to fetch CSV file based upon date request
router.get('/request-date', getDataBasedUponDateRequest)
module.exports = router;
