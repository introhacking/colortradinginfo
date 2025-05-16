const readerFileService = require("../../services/fileReadingServices");

const csv = require('csv-parser');
const fs = require('fs');
const fsp = fs.promises; // Access promise-based fs methods
const path = require('path');
const Papa = require('papaparse');



// GET
exports.getDataFromURL = async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }
    try {
        const data = await readerFileService.fetchCSVData(url);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// GET
// exports.getDataFromURL2 = async (req, res) => {
//     const dates = req.query.dates;

//     try {
//         const result = await getDataFromDates(dates);
//         res.json({ success: true, ...result });
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// };


// GET
exports.getDataFromURL2 = async (req, res) => {
    const dates = req.query.dates;

    try {
        const result = await readerFileService.fetchDataForDates(dates);
        res.json(result);
    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ error: 'Unexpected server error' });
    }
};

// GET ([ WORKING ])
// exports.getDataFromURL2 = async (req, res) => {
//     const dates = req.query.dates;

//     if (!dates || dates.length === 0) {
//         return res.status(400).json({ error: 'No dates provided' });
//     }

//     try {
//         const fetchPromises = dates.map(date => {
//             const url = `https://archives.nseindia.com/products/content/sec_bhavdata_full_${date}.csv`;
//             return readerFileService.fetchDataFromCSV(url)
//                 .then(data => ({ date, data }))
//                 .catch(error => ({ date, error: error.message }));
//         });

//         const results = await Promise.all(fetchPromises);

//         const successData = results.filter(result => !result.error);
//         const failedDates = results.filter(result => result.error);

//         res.json({
//             success: true,
//             fetchedCount: successData.length,
//             failedCount: failedDates.length,
//             data: successData,
//             errors: failedDates,
//         });

//     } catch (error) {
//         console.error("Unexpected error:", error);
//         res.status(500).json({ error: 'Unexpected server error' });
//     }
// };




// GET [REQUEST A FILE TO READ DATA AND SEND TO RESPONSE]

exports.getDataFromURL2Data = async (req, res) => {
    try {
        const fileName = req.query.file;
        if (!fileName) {
            return res.status(400).json({ error: 'File is required' });
        }

        const filePath = path.join(__dirname, '../../uploads/csvfilefolder', fileName);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'CSV file not found' });
        }

        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                res.json(results);
            })
            .on('error', (err) => {
                console.error('CSV Read Error:', err);
                res.status(500).json({ error: 'Failed to read CSV' });
            });

    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// GET ( FILE FILTER BASED UPON DATE REQUEST)

// exports.getDataBasedUponDateRequests = (req, res) => {
//     const { from_date, to_date } = req.query;

//     if (!from_date || !to_date) {
//         return res.status(400).json({ error: 'from_date and to_date are required' });
//     }

//     const folderPath = path.join(__dirname, '../../uploads/csvfilefolder');
//     let mergedCsvData = '';

//     const formatDate = (dateString) => {
//         const [year, month, day] = dateString.split('-');
//         return `${day}${month}${year}`;
//     };

//     const fromDateFormatted = parseInt(formatDate(from_date));
//     const toDateFormatted = parseInt(formatDate(to_date));

//     fs.readdir(folderPath, (err, files) => {
//         if (err) {
//             console.error('Cannot read directory', err);
//             return res.status(500).json({ error: 'Cannot read directory' });
//         }

//         const csvFiles = files.filter(file => {
//             if (!file.endsWith('.csv')) return false;
//             const match = file.match(/data_(\d{8})\.csv/);
//             if (!match) return false;
//             const fileDate = parseInt(match[1]);
//             return fileDate >= fromDateFormatted && fileDate <= toDateFormatted;
//         });

//         if (csvFiles.length === 0) {
//             return res.status(404).json({ message: 'No CSV files found in the selected date range.' });
//         }

//         try {
//             // csvFiles.forEach(file => {
//             //     const filePath = path.join(folderPath, file);
//             //     const fileContent = fs.readFileSync(filePath, 'utf8');
//             //     mergedCsvData += fileContent.trim() + '\n'; // merge csv contents
//             // });

//             csvFiles.forEach((file, index) => {
//                 const filePath = path.join(folderPath, file);
//                 let fileContent = fs.readFileSync(filePath, 'utf8').trim();

//                 if (index !== 0) {
//                     // Remove header from all files except the first one
//                     const firstNewlineIndex = fileContent.indexOf('\n');
//                     if (firstNewlineIndex !== -1) {
//                         fileContent = fileContent.slice(firstNewlineIndex + 1);  // remove header
//                     }
//                 }

//                 mergedCsvData += fileContent + '\n';
//             });


//             // parse merged CSV data into JSON array            
//             const parsedData = Papa.parse(mergedCsvData, {
//                 header: true,
//                 skipEmptyLines: true
//             });

//             // Step 1: Prepare clean array
//             const modifiedArrayData = [];
//             parsedData?.data?.forEach(row => {
//                 modifiedArrayData.push(row);
//             });

//             // Step 2: Group by SYMBOL
//             const symbolGroups = {};

//             modifiedArrayData.forEach(item => {
//                 const symbol = item.SYMBOL?.trim();
//                 if (!symbol) return;

//                 if (!symbolGroups[symbol]) {
//                     symbolGroups[symbol] = {
//                         totalDelQty: 0,
//                         count: 0
//                     };
//                 }

//                 // const delQty = parseFloat(item.DELIV_QTY || item.DELIVERABLE_QTY || item.DELIVERY_QUANTITY || 0);

//                 let rawDelQty = item.DELIV_QTY || item.DELIVERABLE_QTY || item.DELIVERY_QUANTITY || '0';
//                 rawDelQty = rawDelQty.toString().replace(/,/g, '').trim();  // Remove commas, spaces
//                 const delQty = parseFloat(rawDelQty);

//                 if (!isNaN(delQty)) {
//                     symbolGroups[symbol].totalDelQty += delQty;
//                     symbolGroups[symbol].count += 1;
//                 }
//             });

//             // Step 3: Add avg_del_quantity field to each row
//             const finalRows = [];

//             modifiedArrayData.forEach(row => {
//                 const symbol = row.SYMBOL?.trim();
//                 if (!symbol) return;

//                 const group = symbolGroups[symbol];
//                 const avgDelQty = group.totalDelQty / group.count;

//                 row.AVG_DEL_QUALITY = avgDelQty.toFixed(2); // add 2 decimal places
//                 finalRows.push(row);
//             });

//             console.log(finalRows)

//             return res.status(200).json({
//                 status: true,
//                 mergedData: finalRows  // ✅ final data after calculation
//             });

//         } catch (readError) {
//             console.error('Error reading files', readError);
//             res.status(500).json({ error: 'Oops ! No Data Found' });
//         }
//     });
// };


// exports.holdgetDataBasedUponDateRequest = (req, res) => {
//     const { from_date, to_date } = req.query;

//     if (!from_date || !to_date) {
//         return res.status(400).json({ error: 'from_date and to_date are required' });
//     }

//     const folderPath = path.join(__dirname, '../../uploads/csvfilefolder');
//     let mergedCsvData = '';

//     const formatDate = (dateString) => {
//         const [year, month, day] = dateString.split('-');
//         return `${day}${month}${year}`;
//     };

//     const fromDateFormatted = parseInt(formatDate(from_date));
//     const toDateFormatted = parseInt(formatDate(to_date));

//     fs.readdir(folderPath, (err, files) => {
//         if (err) {
//             console.error('Cannot read directory', err);
//             return res.status(500).json({ error: 'Cannot read directory' });
//         }

//         const csvFiles = files.filter(file => {
//             if (!file.endsWith('.csv')) return false;
//             const match = file.match(/data_(\d{8})\.csv/);
//             if (!match) return false;
//             const fileDate = parseInt(match[1]);
//             return fileDate >= fromDateFormatted && fileDate <= toDateFormatted;
//         });

//         if (csvFiles.length === 0) {
//             return res.status(404).json({ message: 'No CSV files found in the selected date range.' });
//         }

//         try {
//             csvFiles.forEach((file, index) => {
//                 const filePath = path.join(folderPath, file);
//                 let fileContent = fs.readFileSync(filePath, 'utf8').trim();

//                 // If not the first file, remove header line
//                 if (index > 0) {
//                     fileContent = fileContent.split('\n').slice(1).join('\n');
//                 }

//                 mergedCsvData += fileContent + '\n';
//             });

//             // parse merged CSV data into JSON array            
//             const parsedData = Papa.parse(mergedCsvData, {
//                 header: true,
//                 skipEmptyLines: true
//             });

//             // Prepare clean array
//             const modifiedArrayData = [];

//             parsedData?.data?.forEach(row => {
//                 const cleanedRow = {};

//                 // 🚀 Trim all keys
//                 Object.keys(row).forEach(key => {
//                     const trimmedKey = key.trim();
//                     cleanedRow[trimmedKey] = row[key];
//                 });

//                 modifiedArrayData.push(cleanedRow);
//             });

//             // parsedData?.data?.forEach(row => {
//             //     modifiedArrayData.push(row);
//             // });

//             // --- Group by SYMBOL (for per-symbol avg) ---
//             const symbolGroups = {};

//             // NEW VERSION CODE
//             modifiedArrayData.forEach(item => {
//                 const symbol = item.SYMBOL?.trim();
//                 if (!symbolGroups[symbol]) {
//                     symbolGroups[symbol] = {
//                         DELIV_QTY_total: 0,
//                         DELIV_PER_total: 0,
//                         TTL_TRD_QNTY_total: 0,
//                         count: 0,
//                         DELIV_QTY_avg: 0.00,
//                         DELIV_PER_avg: 0.00,
//                         TTL_TRD_QNTY_avg: 0.00,

//                     };
//                 }

//                 symbolGroups[symbol].DELIV_QTY_total += +(item.DELIV_QTY);
//                 symbolGroups[symbol].DELIV_PER_total += +(item.DELIV_PER);
//                 symbolGroups[symbol].TTL_TRD_QNTY_total += +(item.TTL_TRD_QNTY);
//                 symbolGroups[symbol].count += 1;


//                 for (const symbol in symbolGroups) {
//                     const entry = symbolGroups[symbol]
//                     entry.DELIV_QTY_avg = (entry.DELIV_QTY_total / entry.count).toFixed(2);
//                     entry.DELIV_PER_avg = (entry.DELIV_PER_total / entry.count).toFixed(2);
//                     entry.TTL_TRD_QNTY_avg = (entry.TTL_TRD_QNTY_total / entry.count).toFixed(2);
//                 }


//             })

//             // console.log(symbolGroups)

//             // modifiedArrayData.forEach(item => {
//             //     const symbol = item.SYMBOL?.trim();
//             //     if (!symbol) return;

//             //     // Get deliverable quantity cleanly
//             //     let rawDelQty = item.DELIV_QTY || item.DELIVERABLE_QTY || item.DELIVERY_QUANTITY || '0';
//             //     // let rawDelQty = item.DELIV_QTY || '0';
//             //     // let rawDelQty = item?.DELIV_QTY || '0';
//             //     rawDelQty = rawDelQty.toString().replace(/,/g, '').trim();
//             //     const delQty = parseFloat(rawDelQty);

//             //     if (!isNaN(delQty)) {
//             //         // Update per-symbol
//             //         if (!symbolGroups[symbol]) {
//             //             symbolGroups[symbol] = { totalDelQty: 0, count: 0 };
//             //         }
//             //         symbolGroups[symbol].totalDelQty += delQty;
//             //         symbolGroups[symbol].count += 1;
//             //     }
//             // });


//             // NEW VERSION CODE
//             //     for(const symbol in symbolGroups){
//             //        const entry = symbolGroups[symbol]
//             //        entry.avgDelQty = entry.totalDelQty / entry.count;
//             //     }
//             //    console.log(symbolGroups)


//             // --- Add avg_del_quantity field per row ---

//             const finalRows = modifiedArrayData.map(row => {
//                 const symbol = row.SYMBOL?.trim();
//                 if (!symbol) return row;

//                 const group = symbolGroups[symbol];

//                 if (!group) {
//                     return row;
//                 }
//                 const avgDelQty = group.totalDelQty / group.count;

//                 return {
//                     ...row,
//                     // AVG_DEL_QUANTITY: avgDelQty.toFixed(2) // Correct spelling
//                 };
//             });

//             return res.status(200).json({
//                 status: true,
//                 overallAverage: symbolGroups, // 🎯 Overall average
//                 mergedData: finalRows // 🎯 Final modified data
//             });

//         } catch (readError) {
//             console.error('Error reading files', readError);
//             return res.status(500).json({ error: 'Oops ! No Data Found' });
//         }
//     });
// }



// exports.great_getDataBasedUponDateRequest = async (req, res) => {
//     try {
//         const { from_date, to_date } = req.query;

//         if (!from_date || !to_date) {
//             return res.status(400).json({ error: 'from_date and to_date are required' });
//         }

//         const folderPath = path.join(__dirname, '../../uploads/csvfilefolder');

//         const formatDate = (dateString) => {
//             const [year, month, day] = dateString.split('-');
//             return `${day}${month}${year}`;
//         };

//         const fromDateFormatted = parseInt(formatDate(from_date));
//         const toDateFormatted = parseInt(formatDate(to_date));

//         const files = await fsp.readdir(folderPath);

//         const csvFiles = files.filter(file => {
//             const match = file.match(/date_(\d{8})\.csv/);
//             if (!match) return false;
//             const fileDate = parseInt(match[1]);
//             return fileDate >= fromDateFormatted && fileDate <= toDateFormatted;
//         });

//         if (csvFiles.length === 0) {
//             return res.status(404).json({ message: 'No CSV files found in the selected date range.' });
//         }

//         // Read all CSV files in parallel
//         const readPromises = csvFiles.map(file => fsp.readFile(path.join(folderPath, file), 'utf8'));
//         const fileContents = await Promise.all(readPromises);

//         // Combine all data into one array (ignore repeated headers)
//         let allRows = [];
//         fileContents.forEach((content, index) => {
//             const parsed = Papa.parse(content.trim(), {
//                 header: true,
//                 skipEmptyLines: true
//             });

//             const cleanedRows = parsed.data.map(row => {
//                 const cleaned = {};
//                 Object.keys(row).forEach(key => {
//                     cleaned[key.trim()] = row[key];
//                 });
//                 return cleaned;
//             });

//             allRows = allRows.concat(cleanedRows);
//         });

//         // Group by SYMBOL
//         const symbolGroups = {};

//         allRows.forEach(row => {
//             const symbol = row.SYMBOL?.trim();
//             if (!symbol) return;

//             if (!symbolGroups[symbol]) {
//                 symbolGroups[symbol] = {
//                     DELIV_QTY_total: 0,
//                     DELIV_PER_total: 0,
//                     TTL_TRD_QNTY_total: 0,
//                     count: 0
//                 };
//             }

//             // Formula should be : (delivery quantity - Avg del quantity )/ delivery quantity

//             symbolGroups[symbol].DELIV_QTY_total += +(row.DELIV_QTY || 0);
//             symbolGroups[symbol].DELIV_PER_total += +(row.DELIV_PER || 0);
//             symbolGroups[symbol].TTL_TRD_QNTY_total += +(row.TTL_TRD_QNTY || 0);
//             symbolGroups[symbol].count += 1;
//         });

//         // Calculate averages
//         for (const symbol in symbolGroups) {
//             const group = symbolGroups[symbol];
//             group.DELIV_QTY_avg = (group.DELIV_QTY_total / group.count).toFixed(2);
//             group.DELIV_PER_avg = (group.DELIV_PER_total / group.count).toFixed(2);
//             group.TTL_TRD_QNTY_avg = (group.TTL_TRD_QNTY_total / group.count).toFixed(2);
//             // Percentage ( (del_q (today) - del_q_avg )/del_q_avg  )
//             group.DELIV_QTY_percentage = (((group.DELIV_QTY_total - group.DELIV_QTY_avg) / group.DELIV_QTY_avg) * 100).toFixed(2) + '%';
//             group.DELIV_PER_percentage = (((group.DELIV_PER_total - group.DELIV_PER_avg) / group.DELIV_PER_avg) * 100).toFixed(2) + '%';
//             group.TTL_TRD_QNTY_percentage = (((group.TTL_TRD_QNTY_total - group.TTL_TRD_QNTY_avg) / group.TTL_TRD_QNTY_avg) * 100).toFixed(2) + '%';
//         }

//         return res.status(200).json({
//             status: true,
//             overallAverage: symbolGroups,
//             mergedData: allRows
//         });

//     } catch (error) {
//         console.error('Error processing request', error);
//         return res.status(500).json({ error: 'Oops! Error processing request.' });
//     }
// };



// exports.greatOnceMore_getDataBasedUponDateRequest = async (req, res) => {
//     try {
//         const { from_date, to_date } = req.query;

//         if (!from_date || !to_date) {
//             return res.status(400).json({ error: 'from_date and to_date are required' });
//         }

//         const folderPath = path.join(__dirname, '../../uploads/csvfilefolder');

//         const formatDate = (dateString) => {
//             const [year, month, day] = dateString.split('-');
//             return `${day}${month}${year}`;
//         };

//         const fromDateFormatted = parseInt(formatDate(from_date));
//         const toDateFormatted = parseInt(formatDate(to_date));
//         const toDateFormattedStr = formatDate(to_date);

//         const files = await fsp.readdir(folderPath);

//         const csvFiles = files.filter(file => {
//             const match = file.match(/date_(\d{8})\.csv/);
//             if (!match) return false;
//             const fileDate = parseInt(match[1]);
//             return fileDate >= fromDateFormatted && fileDate <= toDateFormatted;
//         });

//         if (csvFiles.length === 0) {
//             return res.status(404).json({ message: 'No CSV files found in the selected date range.' });
//         }

//         // Read CSV files and track source file
//         const readPromises = csvFiles.map(file =>
//             fsp.readFile(path.join(folderPath, file), 'utf8').then(content => ({ content, file }))
//         );
//         const fileContents = await Promise.all(readPromises);

//         let allRows = [];
//         fileContents.forEach(({ content, file }) => {
//             const parsed = Papa.parse(content.trim(), {
//                 header: true,
//                 skipEmptyLines: true
//             });

//             const cleanedRows = parsed.data.map(row => {
//                 const cleaned = {};
//                 Object.keys(row).forEach(key => {
//                     cleaned[key.trim()] = row[key];
//                 });
//                 cleaned.SOURCE_FILE = file; // Track origin file
//                 return cleaned;
//             });

//             allRows = allRows.concat(cleanedRows);
//         });

//         // Group all data by SYMBOL
//         const symbolGroups = {};
//         allRows.forEach(row => {
//             const symbol = row.SYMBOL?.trim();
//             if (!symbol) return;

//             if (!symbolGroups[symbol]) {
//                 symbolGroups[symbol] = {
//                     DELIV_QTY_total: 0,
//                     DELIV_PER_total: 0,
//                     TTL_TRD_QNTY_total: 0,
//                     count: 0
//                 };
//             }

//             symbolGroups[symbol].DELIV_QTY_total += +(row.DELIV_QTY || 0);
//             symbolGroups[symbol].DELIV_PER_total += +(row.DELIV_PER || 0);
//             symbolGroups[symbol].TTL_TRD_QNTY_total += +(row.TTL_TRD_QNTY || 0);
//             symbolGroups[symbol].count += 1;
//         });

//         // Extract rows only from to_date
//         const toDateRows = allRows.filter(row => {
//             const match = row.SOURCE_FILE?.match(/date_(\d{8})\.csv/);
//             return match && match[1] === toDateFormattedStr;
//         });

//         // Group to_date rows by symbol
//         const toDateSymbolMap = {};
//         toDateRows.forEach(row => {
//             const symbol = row.SYMBOL?.trim();
//             if (!symbol) return;

//             toDateSymbolMap[symbol] = {
//                 DELIV_QTY: +(row.DELIV_QTY || 0),
//                 DELIV_PER: +(row.DELIV_PER || 0),
//                 TTL_TRD_QNTY: +(row.TTL_TRD_QNTY || 0)
//             };
//         });

//         // Final calculations with to_date percentages
//         for (const symbol in symbolGroups) {
//             const group = symbolGroups[symbol];
//             const toDateValues = toDateSymbolMap[symbol];

//             group.DELIV_QTY_avg = (group.DELIV_QTY_total / group.count).toFixed(2);
//             group.DELIV_PER_avg = (group.DELIV_PER_total / group.count).toFixed(2);
//             group.TTL_TRD_QNTY_avg = (group.TTL_TRD_QNTY_total / group.count).toFixed(2);

//             if (toDateValues && toDateValues.DELIV_QTY !== 0) {
//                 group.DELIV_QTY_percentage = (((toDateValues.DELIV_QTY - group.DELIV_QTY_avg) / toDateValues.DELIV_QTY) * 100).toFixed(2) + '%';
//             } else {
//                 group.DELIV_QTY_percentage = 'N/A';
//             }

//             if (toDateValues && toDateValues.DELIV_PER !== 0) {
//                 group.DELIV_PER_percentage = (((toDateValues.DELIV_PER - group.DELIV_PER_avg) / toDateValues.DELIV_PER) * 100).toFixed(2) + '%';
//             } else {
//                 group.DELIV_PER_percentage = 'N/A';
//             }

//             if (toDateValues && toDateValues.TTL_TRD_QNTY !== 0) {
//                 group.TTL_TRD_QNTY_percentage = (((toDateValues.TTL_TRD_QNTY - group.TTL_TRD_QNTY_avg) / toDateValues.TTL_TRD_QNTY) * 100).toFixed(2) + '%';
//             } else {
//                 group.TTL_TRD_QNTY_percentage = 'N/A';
//             }
//         }

//         return res.status(200).json({
//             status: true,
//             overallAverage: symbolGroups,
//             mergedData: allRows
//         });

//     } catch (error) {
//         console.error('Error processing request', error);
//         return res.status(500).json({ error: 'Oops! Error processing request.' });
//     }
// };


// exports.wait__getDataBasedUponDateRequest = async (req, res) => {
//     try {
//         const { from_date, to_date } = req.query;

//         if (!from_date || !to_date) {
//             return res.status(400).json({ error: 'from_date and to_date are required' });
//         }

//         const folderPath = path.join(__dirname, '../../uploads/csvfilefolder');

//         const formatDate = (dateString) => {
//             const [year, month, day] = dateString.split('-');
//             return `${year}${month}${day}`; // YYYYMMDD
//             // return `${day}${month}${year}`; // YYYYMMDD
//         };

//         const fromDateFormatted = formatDate(from_date); // e.g. 20250401
//         const toDateFormatted = formatDate(to_date);     // e.g. 20250430

//         const files = await fsp.readdir(folderPath);

//         const csvFiles = files.filter(file => {
//             const match = file.match(/date_(\d{8})\.csv/);
//             if (!match) return false;

//             const rawFileDate = match[1]; // e.g. "14032025"

//             // Convert DDMMYYYY to YYYYMMDD
//             const day = rawFileDate.substring(0, 2);
//             const month = rawFileDate.substring(2, 4);
//             const year = rawFileDate.substring(4, 8);
//             const fileDate = `${year}${month}${day}`; // "20250314"

//             return fileDate >= fromDateFormatted && fileDate <= toDateFormatted;
//         });

//         if (csvFiles.length === 0) {
//             return res.status(404).json({ message: 'No CSV files found in the selected date range.' });
//         }

//         // Read all CSV files
//         const readPromises = csvFiles.map(file => fsp.readFile(path.join(folderPath, file), 'utf8'));
//         const fileContents = await Promise.all(readPromises);

//         let allRows = [];
//         fileContents.forEach((content, index) => {
//             const parsed = Papa.parse(content.trim(), {
//                 header: true,
//                 skipEmptyLines: true
//             });

//             const cleanedRows = parsed.data.map(row => {
//                 const cleaned = {};
//                 Object.keys(row).forEach(key => {
//                     cleaned[key.trim()] = row[key];
//                 });
//                 return cleaned;
//             });

//             const filename = csvFiles[index];
//             cleanedRows.forEach(row => row.SOURCE_FILE = filename);
//             allRows = allRows.concat(cleanedRows);
//         });

//         const getDDMMYYYY = (dateString) => {
//             const [year, month, day] = dateString.split('-');
//             return `${day}${month}${year}`; // DDMMYYYY
//         };

//         // Group by SYMBOL
//         const symbolGroups = {};
//         const toDateFile = `date_${getDDMMYYYY(to_date)}.csv`;

//         allRows.forEach(row => {
//             const symbol = row.SYMBOL?.trim();
//             if (!symbol) return;

//             if (!symbolGroups[symbol]) {
//                 symbolGroups[symbol] = {
//                     DELIV_QTY_total: 0,
//                     DELIV_PER_total: 0,
//                     TTL_TRD_QNTY_total: 0,
//                     count: 0,
//                     to_date_row: null
//                 };
//             }

//             symbolGroups[symbol].DELIV_QTY_total += +(row.DELIV_QTY || 0);
//             symbolGroups[symbol].DELIV_PER_total += +(row.DELIV_PER || 0);
//             symbolGroups[symbol].TTL_TRD_QNTY_total += +(row.TTL_TRD_QNTY || 0);
//             symbolGroups[symbol].count += 1;

//             if (row.SOURCE_FILE === toDateFile) {
//                 symbolGroups[symbol].to_date_row = {
//                     DELIV_QTY: +(row.DELIV_QTY || 0),
//                     DELIV_PER: +(row.DELIV_PER || 0),
//                     TTL_TRD_QNTY: +(row.TTL_TRD_QNTY || 0)
//                 };
//             }
//         });

//         // Generate averages and percentage differences
//         const messages = [];
//         const alerts = [];

//         for (const symbol in symbolGroups) {
//             const group = symbolGroups[symbol];

//             const avgQty = group.DELIV_QTY_total / group.count;
//             const avgPer = group.DELIV_PER_total / group.count;
//             const avgQtyTraded = group.TTL_TRD_QNTY_total / group.count;

//             group.DELIV_QTY_avg = avgQty.toFixed(2);
//             group.DELIV_PER_avg = avgPer.toFixed(2);
//             group.TTL_TRD_QNTY_avg = avgQtyTraded.toFixed(2);

//             if (group.to_date_row) {
//                 const qty = group.to_date_row.DELIV_QTY;
//                 const per = group.to_date_row.DELIV_PER;
//                 const qtyTraded = group.to_date_row.TTL_TRD_QNTY;

//                 // Use numeric values for comparison
//                 const percentChangeValue = qty ? ((qty - avgQty) / qty) * 100 : 0;
//                 const percentChangePer = per ? ((per - avgPer) / per) * 100 : 0;
//                 const percentChangeQtyTraded = qtyTraded ? ((qtyTraded - avgQtyTraded) / qtyTraded) * 100 : 0;

//                 // Save formatted strings for display
//                 group.DELIV_QTY_percentage = percentChangeValue.toFixed(2) + '%';
//                 group.DELIV_PER_percentage = percentChangePer.toFixed(2) + '%';
//                 group.TTL_TRD_QNTY_percentage = percentChangeQtyTraded.toFixed(2) + '%';

//                 const diff = (qty - avgQty).toFixed(2);
//                 const direction = diff > 0 ? 'higher' : 'lower';

//                 messages.push(
//                     `On ${to_date}, ${symbol} had a delivery quantity ${group.DELIV_QTY_percentage} ${direction} than its average from ${from_date} to ${to_date}.`
//                 );

//                 // ✅ Correct numeric comparison
//                 if (percentChangeValue > 63) {
//                     const alertMsg = `🚀 ${symbol} had a delivery quantity over 100% higher than average on ${to_date} — significant spike detected!`;
//                     messages.push(alertMsg);
//                     alerts.push({
//                         symbol,
//                         message: alertMsg,
//                         percentChange: group.DELIV_QTY_percentage
//                     });
//                 }
//             } else {
//                 group.DELIV_QTY_percentage = 'N/A';
//                 group.DELIV_PER_percentage = 'N/A';
//                 group.TTL_TRD_QNTY_percentage = 'N/A';
//                 messages.push(`No data for ${symbol} on ${to_date}.`);
//             }
//         }

//         return res.status(200).json({
//             status: true,
//             overallAverage: symbolGroups,
//             messages,
//             alerts,
//             mergedData: allRows
//         });

//     } catch (error) {
//         console.error('Error processing request', error);
//         return res.status(500).json({ error: 'Oops! Error processing request.' });
//     }
// };


// exports.getDataBasedUponDateRequest_modified = async (req, res) => {
//     try {
//         const { from_date, to_date } = req.query;

//         if (!from_date || !to_date) {
//             return res.status(400).json({ error: 'from_date and to_date are required' });
//         }

//         const folderPath = path.join(__dirname, '../../uploads/csvfilefolder');

//         const formatDate = (dateString) => {
//             const [year, month, day] = dateString.split('-');
//             return `${year}${month}${day}`;
//         };

//         const getDDMMYYYY = (dateString) => {
//             const [year, month, day] = dateString.split('-');
//             return `${day}${month}${year}`;
//         };

//         const fromDateFormatted = formatDate(from_date);
//         const toDateFormatted = formatDate(to_date);
//         const toDateFile = `date_${getDDMMYYYY(to_date)}.csv`;

//         const files = await fsp.readdir(folderPath);

//         const csvFiles = files.filter(file => {
//             const match = file.match(/date_(\d{8})\.csv/);
//             if (!match) return false;

//             const rawFileDate = match[1];
//             const day = rawFileDate.substring(0, 2);
//             const month = rawFileDate.substring(2, 4);
//             const year = rawFileDate.substring(4, 8);
//             const fileDate = `${year}${month}${day}`;

//             return fileDate >= fromDateFormatted && fileDate <= toDateFormatted;
//         });

//         if (csvFiles.length === 0) {
//             return res.status(404).json({ message: 'No CSV files found in the selected date range.' });
//         }

//         // Read all files
//         const readPromises = csvFiles.map(file => fsp.readFile(path.join(folderPath, file), 'utf8'));
//         const fileContents = await Promise.all(readPromises);

//         let allRows = [];
//         fileContents.forEach((content, index) => {
//             const parsed = Papa.parse(content.trim(), {
//                 header: true,
//                 skipEmptyLines: true
//             });

//             const cleanedRows = parsed.data.map(row => {
//                 const cleaned = {};
//                 Object.keys(row).forEach(key => {
//                     cleaned[key.trim()] = row[key];
//                 });
//                 return cleaned;
//             });

//             const filename = csvFiles[index];
//             cleanedRows.forEach(row => row.SOURCE_FILE = filename);
//             allRows = allRows.concat(cleanedRows);
//         });

//         // Group by SYMBOL
//         const symbolGroups = {};

//         allRows.forEach(row => {
//             const symbol = row.SYMBOL?.trim();
//             if (!symbol) return;

//             if (!symbolGroups[symbol]) {
//                 symbolGroups[symbol] = {
//                     DELIV_QTY_total: 0,
//                     DELIV_PER_total: 0,
//                     TTL_TRD_QNTY_total: 0,
//                     count: 0,
//                     to_date_row: null
//                 };
//             }

//             if (row.SOURCE_FILE === toDateFile) {
//                 symbolGroups[symbol].to_date_row = {
//                     DELIV_QTY: +(row.DELIV_QTY || 0),
//                     DELIV_PER: +(row.DELIV_PER || 0),
//                     TTL_TRD_QNTY: +(row.TTL_TRD_QNTY || 0)
//                 };
//             } else {
//                 symbolGroups[symbol].DELIV_QTY_total += +(row.DELIV_QTY || 0);
//                 symbolGroups[symbol].DELIV_PER_total += +(row.DELIV_PER || 0);
//                 symbolGroups[symbol].TTL_TRD_QNTY_total += +(row.TTL_TRD_QNTY || 0);
//                 symbolGroups[symbol].count += 1;
//             }
//         });

//         // Generate averages and percentage differences
//         const messages = [];
//         const alerts = [];

//         for (const symbol in symbolGroups) {
//             const group = symbolGroups[symbol];

//             const avgQty = group.count > 0 ? group.DELIV_QTY_total / group.count : 0;
//             const avgPer = group.count > 0 ? group.DELIV_PER_total / group.count : 0;
//             const avgQtyTraded = group.count > 0 ? group.TTL_TRD_QNTY_total / group.count : 0;

//             group.DELIV_QTY_avg = avgQty.toFixed(2);
//             group.DELIV_PER_avg = avgPer.toFixed(2);
//             group.TTL_TRD_QNTY_avg = avgQtyTraded.toFixed(2);

//             if (group.to_date_row) {
//                 const qty = group.to_date_row.DELIV_QTY;
//                 const per = group.to_date_row.DELIV_PER;
//                 const qtyTraded = group.to_date_row.TTL_TRD_QNTY;

//                 // const percentChangeValue = qty ? ((qty - avgQty) / qty) * 100 : 0;
//                 const percentChangeValue = qty ? ((qty - avgQty) / avgQty) * 100 : 0;
//                 const percentChangePer = per ? ((per - avgPer) / per) * 100 : 0;
//                 const percentChangeQtyTraded = qtyTraded ? ((qtyTraded - avgQtyTraded) / qtyTraded) * 100 : 0;

//                 group.DELIV_QTY_percentage = percentChangeValue.toFixed(2) + '%';
//                 group.DELIV_PER_percentage = percentChangePer.toFixed(2) + '%';
//                 group.TTL_TRD_QNTY_percentage = percentChangeQtyTraded.toFixed(2) + '%';

//                 const diff = (qty - avgQty).toFixed(2);
//                 const direction = diff > 0 ? 'higher' : 'lower';

//                 messages.push(
//                     `On ${to_date}, ${symbol} had a delivery quantity ${group.DELIV_QTY_percentage} ${direction} than its average from ${from_date} to ${to_date} (excluding ${to_date}).`
//                 );

//                 if (percentChangeValue >= 100) {
//                     const alertMsg = `🚀 ${symbol} had a delivery quantity over 100% higher than average on ${to_date} — significant spike detected!`;
//                     messages.push(alertMsg);
//                     alerts.push({
//                         symbol,
//                         message: alertMsg,
//                         percentChange: group.DELIV_QTY_percentage
//                     });
//                 }
//             } else {
//                 group.DELIV_QTY_percentage = 'N/A';
//                 group.DELIV_PER_percentage = 'N/A';
//                 group.TTL_TRD_QNTY_percentage = 'N/A';
//                 messages.push(`No data for ${symbol} on ${to_date}.`);
//             }
//         }

//         return res.status(200).json({
//             status: true,
//             overallAverage: symbolGroups,
//             messages,
//             alerts,
//             mergedData: allRows
//         });

//     } catch (error) {
//         console.error('Error processing request', error);
//         return res.status(500).json({ error: 'Oops! Error processing request.' });
//     }
// };


// [ COMPARE LAST 10 DAYS RECORDS ]
// exports.getDataBasedUponDateRequest_10days = async (req, res) => {
//     try {
//         const { from_date, to_date } = req.query;

//         if (!from_date || !to_date) {
//             return res.status(400).json({ error: 'from_date and to_date are required' });
//         }

//         const folderPath = path.join(__dirname, '../../uploads/csvfilefolder');

//         const formatDate = (dateString) => {
//             const [year, month, day] = dateString.split('-');
//             return `${year}${month}${day}`;
//         };

//         const getDDMMYYYY = (dateString) => {
//             const [year, month, day] = dateString.split('-');
//             return `${day}${month}${year}`;
//         };

//         const fromDateFormatted = formatDate(from_date);
//         const toDateFormatted = formatDate(to_date);
//         const toDateFile = `date_${getDDMMYYYY(to_date)}.csv`;

//         const files = await fsp.readdir(folderPath);

//         const filteredCsvFiles = files
//             .filter(file => /^date_(\d{8})\.csv$/.test(file))
//             .map(file => {
//                 const match = file.match(/^date_(\d{8})\.csv$/);
//                 const rawDate = match[1]; // e.g., "06052025"
//                 const day = rawDate.slice(0, 2);
//                 const month = rawDate.slice(2, 4);
//                 const year = rawDate.slice(4, 8);
//                 const formattedDate = `${year}${month}${day}`;
//                 return { file, formattedDate };
//             })
//             .filter(f => f.formattedDate >= fromDateFormatted && f.formattedDate <= toDateFormatted);

//         if (filteredCsvFiles.length === 0) {
//             return res.status(404).json({ message: 'No CSV files found in the selected date range.' });
//         }

//         const allRows = [];
//         const todayFilename = toDateFile;

//         for (const { file } of filteredCsvFiles) {
//             const content = await fsp.readFile(path.join(folderPath, file), 'utf8');
//             const parsed = Papa.parse(content.trim(), {
//                 header: true,
//                 skipEmptyLines: true
//             });

//             const cleanedRows = parsed.data.map(row => {
//                 const cleaned = {};
//                 Object.keys(row).forEach(key => {
//                     cleaned[key.trim()] = row[key];
//                 });
//                 cleaned.SOURCE_FILE = file;
//                 return cleaned;
//             });

//             allRows.push(...cleanedRows);
//         }

//         // Group by SYMBOL
//         const symbolGroups = {};

//         allRows.forEach(row => {
//             const symbol = row.SYMBOL?.trim();
//             if (!symbol) return;

//             if (!symbolGroups[symbol]) {
//                 symbolGroups[symbol] = {
//                     DELIV_QTY_total: 0,
//                     DELIV_PER_total: 0,
//                     TTL_TRD_QNTY_total: 0,
//                     count: 0,
//                     to_date_row: null
//                 };
//             }

//             if (row.SOURCE_FILE === todayFilename) {
//                 symbolGroups[symbol].to_date_row = {
//                     DELIV_QTY: +(row.DELIV_QTY || 0),
//                     DELIV_PER: +(row.DELIV_PER || 0),
//                     TTL_TRD_QNTY: +(row.TTL_TRD_QNTY || 0)
//                 };
//             } else {
//                 symbolGroups[symbol].DELIV_QTY_total += +(row.DELIV_QTY || 0);
//                 symbolGroups[symbol].DELIV_PER_total += +(row.DELIV_PER || 0);
//                 symbolGroups[symbol].TTL_TRD_QNTY_total += +(row.TTL_TRD_QNTY || 0);
//                 symbolGroups[symbol].count += 1;
//             }
//         });

//         // Generate averages and comparisons
//         const messages = [];
//         const alerts = [];

//         for (const symbol in symbolGroups) {
//             const group = symbolGroups[symbol];

//             const avgQty = group.count > 0 ? group.DELIV_QTY_total / group.count : 0;
//             const avgPer = group.count > 0 ? group.DELIV_PER_total / group.count : 0;
//             const avgQtyTraded = group.count > 0 ? group.TTL_TRD_QNTY_total / group.count : 0;

//             group.DELIV_QTY_avg = avgQty.toFixed(2);
//             group.DELIV_PER_avg = avgPer.toFixed(2);
//             group.TTL_TRD_QNTY_avg = avgQtyTraded.toFixed(2);

//             if (group.to_date_row) {
//                 const qty = group.to_date_row.DELIV_QTY;
//                 const per = group.to_date_row.DELIV_PER;
//                 const qtyTraded = group.to_date_row.TTL_TRD_QNTY;

//                 const percentChangeValue = qty ? ((qty - avgQty) / qty) * 100 : 0; //qty -> avgQty
//                 const percentChangePer = per ? ((per - avgPer) / per) * 100 : 0;
//                 const percentChangeQtyTraded = qtyTraded ? ((qtyTraded - avgQtyTraded) / qtyTraded) * 100 : 0; // qtyTraded -> avgQtyTraded

//                 group.DELIV_QTY_percentage = percentChangeValue.toFixed(2) + '%';
//                 group.DELIV_PER_percentage = percentChangePer.toFixed(2) + '%';
//                 group.TTL_TRD_QNTY_percentage = percentChangeQtyTraded.toFixed(2) + '%';

//                 const diff = (qty - avgQty).toFixed(2);
//                 const direction = diff > 0 ? 'higher' : 'lower';

//                 messages.push(
//                     `On ${to_date}, ${symbol} had a delivery quantity ${group.DELIV_QTY_percentage} ${direction} than its average from ${from_date} to ${to_date} (excluding ${to_date}).`
//                 );

//                 if (percentChangeValue >= 100) {
//                     const alertMsg = `🚀 ${symbol} had a delivery quantity over 100% higher than average on ${to_date} — significant spike detected!`;
//                     messages.push(alertMsg);
//                     alerts.push({
//                         symbol,
//                         message: alertMsg,
//                         percentChange: group.DELIV_QTY_percentage
//                     });
//                 }
//             } else {
//                 group.DELIV_QTY_percentage = 'N/A';
//                 group.DELIV_PER_percentage = 'N/A';
//                 group.TTL_TRD_QNTY_percentage = 'N/A';
//                 messages.push(`No data for ${symbol} on ${to_date}.`);
//             }
//         }

//         return res.status(200).json({
//             status: true,
//             overallAverage: symbolGroups,
//             messages,
//             alerts,
//             mergedData: allRows
//         });

//     } catch (error) {
//         console.error('Error processing request', error);
//         return res.status(500).json({ error: 'Oops! Error processing request.' });
//     }
// };


//  [ COMPARE LAST 3 DAYS RECORDS FROM TO_DAYS ]
// exports.getDataBasedUponDateRequest_3days = async (req, res) => {
//     try {
//         const { to_date } = req.query;

//         if (!to_date) {
//             return res.status(400).json({ error: 'to_date is required' });
//         }

//         const folderPath = path.join(__dirname, '../../uploads/csvfilefolder');

//         // Convert YYYY-MM-DD → YYYYMMDD
//         const formatDate = (dateString) => {
//             const [year, month, day] = dateString.split('-');
//             return `${year}${month}${day}`;
//         };

//         // Convert YYYY-MM-DD → DDMMYYYY for filename lookup
//         const getDDMMYYYY = (dateString) => {
//             const [year, month, day] = dateString.split('-');
//             return `${day}${month}${year}`;
//         };

//         const toDateFormatted = formatDate(to_date); // e.g. "20250508"
//         const toDateFile = `date_${getDDMMYYYY(to_date)}.csv`; // e.g. "date_08052025.csv"

//         // STEP 1: Read all CSV filenames
//         const files = await fsp.readdir(folderPath);

//         // STEP 2: Extract valid CSV files and normalize their dates to YYYYMMDD
//         const fileDateMap = files
//             .filter(file => /^date_(\d{8})\.csv$/.test(file)) // Ensure format
//             .map(file => {
//                 const rawDate = file.match(/^date_(\d{8})\.csv$/)[1]; // e.g. "08052025"
//                 const day = rawDate.slice(0, 2);
//                 const month = rawDate.slice(2, 4);
//                 const year = rawDate.slice(4, 8);
//                 const formatted = `${year}${month}${day}`; // "20250508"
//                 return { file, rawDate, formatted }; // Keep both
//             });

//         // STEP 3: Sort dates descending
//         const sortedFormattedDates = fileDateMap
//             .map(entry => entry.formatted)
//             .sort((a, b) => b.localeCompare(a));

//         // STEP 4: Get the 3 most recent files before `to_date`
//         const priorDates = sortedFormattedDates
//             .filter(d => d < toDateFormatted)
//             .slice(0, 3);

//         // Include the target date file if it exists
//         if (sortedFormattedDates.includes(toDateFormatted)) {
//             priorDates.unshift(toDateFormatted);
//         }

//         // STEP 5: Filter files that match selected dates
//         const filteredCsvFiles = fileDateMap.filter(entry =>
//             priorDates.includes(entry.formatted)
//         );

//         if (filteredCsvFiles.length === 0) {
//             return res.status(404).json({ message: 'No CSV files found for the target and previous 3 days.' });
//         }

//         // STEP 6: Read & parse relevant CSVs
//         const allRows = [];
//         const groupedByDate = {};

//         for (const { file, rawDate } of filteredCsvFiles) {
//             const content = await fsp.readFile(path.join(folderPath, file), 'utf8');
//             const parsed = Papa.parse(content.trim(), {
//                 header: true,
//                 skipEmptyLines: true
//             });

//             // Convert back to YYYY-MM-DD for grouping
//             const year = rawDate.slice(4, 8);
//             const month = rawDate.slice(2, 4);
//             const day = rawDate.slice(0, 2);
//             const recordDate = `${year}-${month}-${day}`;

//             const cleanedRows = parsed.data.map(row => {
//                 const cleaned = {};
//                 Object.keys(row).forEach(key => {
//                     cleaned[key.trim()] = row[key];
//                 });
//                 cleaned.SOURCE_FILE = file;
//                 cleaned.RECORD_DATE = recordDate;
//                 return cleaned;
//             });

//             allRows.push(...cleanedRows);
//             groupedByDate[recordDate] = (groupedByDate[recordDate] || []).concat(cleanedRows);
//         }

//         // STEP 7: Group by SYMBOL & calculate metrics
//         const symbolGroups = {};

//         allRows.forEach(row => {
//             const symbol = row.SYMBOL?.trim();
//             if (!symbol) return;

//             if (!symbolGroups[symbol]) {
//                 symbolGroups[symbol] = {
//                     DELIV_QTY_total: 0,
//                     DELIV_PER_total: 0,
//                     TTL_TRD_QNTY_total: 0,
//                     count: 0,
//                     to_date_row: null
//                 };
//             }

//             if (row.SOURCE_FILE === toDateFile) {
//                 symbolGroups[symbol].to_date_row = {
//                     DELIV_QTY: +(row.DELIV_QTY || 0),
//                     DELIV_PER: +(row.DELIV_PER || 0),
//                     TTL_TRD_QNTY: +(row.TTL_TRD_QNTY || 0)
//                 };
//             } else {
//                 symbolGroups[symbol].DELIV_QTY_total += +(row.DELIV_QTY || 0);
//                 symbolGroups[symbol].DELIV_PER_total += +(row.DELIV_PER || 0);
//                 symbolGroups[symbol].TTL_TRD_QNTY_total += +(row.TTL_TRD_QNTY || 0);
//                 symbolGroups[symbol].count += 1;
//             }
//         });

//         // STEP 8: Compare to average and generate alerts
//         const messages = [];
//         const alerts = [];

//         for (const symbol in symbolGroups) {
//             const group = symbolGroups[symbol];

//             const avgQty = group.count > 0 ? group.DELIV_QTY_total / group.count : 0;
//             const avgPer = group.count > 0 ? group.DELIV_PER_total / group.count : 0;
//             const avgQtyTraded = group.count > 0 ? group.TTL_TRD_QNTY_total / group.count : 0;

//             group.DELIV_QTY_avg = avgQty.toFixed(2);
//             group.DELIV_PER_avg = avgPer.toFixed(2);
//             group.TTL_TRD_QNTY_avg = avgQtyTraded.toFixed(2);

//             if (group.to_date_row) {
//                 const qty = group.to_date_row.DELIV_QTY;
//                 const per = group.to_date_row.DELIV_PER;
//                 const qtyTraded = group.to_date_row.TTL_TRD_QNTY;

//                 const percentChangeValue = qty ? ((qty - avgQty) / avgQty) * 100 : 0; // change to /avgQty -> /qty (divided by option)
//                 const percentChangePer = per ? ((per - avgPer) / per) * 100 : 0;
//                 const percentChangeQtyTraded = qtyTraded ? ((qtyTraded - avgQtyTraded) / avgQtyTraded) * 100 : 0; // change to /qtyTraded -> /avgQtyTraded (divided by option)

//                 group.DELIV_QTY_percentage = percentChangeValue.toFixed(2) + '%';
//                 group.DELIV_PER_percentage = percentChangePer.toFixed(2) + '%';
//                 group.TTL_TRD_QNTY_percentage = percentChangeQtyTraded.toFixed(2) + '%';

//                 const diff = (qty - avgQty).toFixed(2);
//                 const direction = diff > 0 ? 'higher' : 'lower';

//                 messages.push(
//                     `On ${to_date}, ${symbol} had a delivery quantity ${group.DELIV_QTY_percentage} ${direction} than its average from previous 3 available days.`
//                 );

//                 if (percentChangeValue >= 100) {
//                     const alertMsg = `🚀 ${symbol} had a delivery quantity over 100% higher than average on ${to_date} — significant spike detected!`;
//                     messages.push(alertMsg);
//                     alerts.push({
//                         symbol,
//                         message: alertMsg,
//                         percentChange: group.DELIV_QTY_percentage
//                     });
//                 }
//             } else {
//                 group.DELIV_QTY_percentage = 'N/A';
//                 group.DELIV_PER_percentage = 'N/A';
//                 group.TTL_TRD_QNTY_percentage = 'N/A';
//                 messages.push(`No data for ${symbol} on ${to_date}.`);
//             }
//         }

//         // STEP 9: Respond with data
//         return res.status(200).json({
//             status: true,
//             overallAverage: symbolGroups,
//             messages,
//             alerts,
//             mergedData: allRows,
//             groupedByDate
//         });

//     } catch (error) {
//         console.error('Error processing request', error);
//         return res.status(500).json({ error: 'Oops! Error processing request.' });
//     }
// };


//  [ COMPARE LAST 5 DAYS RECORDS FROM TO_DAYS ]
exports.getDataBasedUponDateRequest = async (req, res) => {
    try {
        const { to_date } = req.query;

        if (!to_date) {
            return res.status(400).json({ error: 'to_date is required' });
        }

        const folderPath = path.join(__dirname, '../../uploads/csvfilefolder');

        const formatDate = (dateString) => {
            const [year, month, day] = dateString.split('-');
            return `${year}${month}${day}`;
        };

        const toDateFormatted = formatDate(to_date);

        const files = await fsp.readdir(folderPath);

        const fileDateMap = files
            .filter(file => /^date_(\d{8})\.csv$/.test(file))
            .map(file => {
                const rawDate = file.match(/^date_(\d{8})\.csv$/)[1];
                const day = rawDate.slice(0, 2);
                const month = rawDate.slice(2, 4);
                const year = rawDate.slice(4, 8);
                const formatted = `${year}${month}${day}`;
                return { file, rawDate, formatted };
            })
            .sort((a, b) => b.formatted.localeCompare(a.formatted));

        const allDates = fileDateMap.map(entry => entry.formatted);

        const mainDates = allDates.filter(d => d <= toDateFormatted).slice(0, 5);

        const dateAverages = {};
        const includedFilesByDate = {};
        let allRows = [];
        let symbolGroups = {};
        let messages = [];
        let alerts = [];

        for (const mainDate of mainDates) {
            const priorDates = allDates.filter(d => d < mainDate).slice(0, 5);
            const mainFile = fileDateMap.find(e => e.formatted === mainDate)?.file;
            const priorFiles = fileDateMap.filter(e => priorDates.includes(e.formatted));

            if (!mainFile || priorFiles.length < 5) continue;

            const rowsThisCycle = [];

            // Load main file
            const mainContent = await fsp.readFile(path.join(folderPath, mainFile), 'utf8');
            const mainParsed = Papa.parse(mainContent.trim(), { header: true, skipEmptyLines: true });
            const mainDateISO = `${mainDate.slice(0, 4)}-${mainDate.slice(4, 6)}-${mainDate.slice(6)}`;

            const mainRows = mainParsed.data.map(row => {
                const cleaned = {};
                Object.keys(row).forEach(key => {
                    cleaned[key.trim()] = row[key];
                });

                if (!cleaned.SYMBOL || cleaned.SERIES?.trim() !== 'EQ') return null; // Adding

                cleaned.SOURCE_FILE = mainFile;
                cleaned.RECORD_DATE = mainDateISO;
                return cleaned;
            }).filter(Boolean);
            rowsThisCycle.push(...mainRows);

            // Load prior 5 days' files
            for (const { file, formatted } of priorFiles) {
                const content = await fsp.readFile(path.join(folderPath, file), 'utf8');
                const parsed = Papa.parse(content.trim(), { header: true, skipEmptyLines: true });
                const dateISO = `${formatted.slice(0, 4)}-${formatted.slice(4, 6)}-${formatted.slice(6)}`;
                const rows = parsed.data.map(row => {
                    const cleaned = {};
                    Object.keys(row).forEach(key => {
                        cleaned[key.trim()] = row[key];
                    });
                    cleaned.SOURCE_FILE = file;
                    cleaned.RECORD_DATE = dateISO;
                    return cleaned;
                });
                rowsThisCycle.push(...rows);
            }

            // Merge into global allRows
            allRows.push(...rowsThisCycle);

            // Process symbol data
            const tempSymbolGroups = {};

            // List of symbols to exclude
            const excludedSymbols = ['1018GS2026', '20MICRONS', '360ONE', '515GS2025', '3IINFOLTD', '68GS2060', 'AERON'];

            rowsThisCycle.forEach(row => {
                const symbol = row.SYMBOL?.trim();

                // if (!symbol || excludedSymbols.includes(symbol)) return; // Skip excluded symbols

                if (!symbol || row.SERIES?.trim() !== 'EQ') return; // Include only SERIES = EQ

                if (!tempSymbolGroups[symbol]) {
                    tempSymbolGroups[symbol] = {
                        DELIV_QTY_total: 0,
                        TTL_TRD_QNTY_total: 0,
                        count: 0,
                        to_date_row: null
                    };
                }
                if (row.RECORD_DATE === mainDateISO) {
                    tempSymbolGroups[symbol].to_date_row = {
                        DELIV_QTY: +(row.DELIV_QTY || 0),
                        TTL_TRD_QNTY: +(row.TTL_TRD_QNTY || 0)
                    };
                } else {
                    tempSymbolGroups[symbol].DELIV_QTY_total += +(row.DELIV_QTY || 0);
                    tempSymbolGroups[symbol].TTL_TRD_QNTY_total += +(row.TTL_TRD_QNTY || 0);
                    tempSymbolGroups[symbol].count += 1;
                }
            });

            // Calculate averages and messages
            for (const symbol in tempSymbolGroups) {
                const group = tempSymbolGroups[symbol];
                const avgQty = group.count > 0 ? group.DELIV_QTY_total / group.count : 0;
                const avgQtyTraded = group.count > 0 ? group.TTL_TRD_QNTY_total / group.count : 0;
                group.DELIV_QTY_avg = avgQty.toFixed(2);
                group.TTL_TRD_QNTY_avg = avgQtyTraded.toFixed(2);

                if (group.to_date_row) {
                    const qty = group.to_date_row.DELIV_QTY;
                    const qtyTraded = group.to_date_row.TTL_TRD_QNTY;
                    const percentChangeValue = avgQty > 0 ? ((qty - avgQty) / avgQty) * 100 : 0;
                    const percentChangeQtyTraded = avgQtyTraded > 0 ? ((qtyTraded - avgQtyTraded) / avgQtyTraded) * 100 : 0;
                    group.DELIV_QTY_percentage = percentChangeValue.toFixed(2) + '%';
                    group.TTL_TRD_QNTY_percentage = percentChangeQtyTraded.toFixed(2) + '%';

                    const diff = (qty - avgQty).toFixed(2);
                    const direction = diff > 0 ? 'higher' : 'lower';
                    messages.push(
                        `On ${mainDateISO}, ${symbol} had a delivery quantity ${group.DELIV_QTY_percentage} ${direction} than its 3-day average.`
                    );

                    if (percentChangeValue >= 250) {
                        const alertMsg = `🚀 ${symbol} had a delivery quantity over 100% higher than average on ${mainDateISO}!`;
                        alerts.push({ symbol, message: alertMsg, percentChange: group.DELIV_QTY_percentage });
                    }
                }
            }

            // Save to response parts
            symbolGroups = tempSymbolGroups;
            dateAverages[`${mainDateISO}`] = tempSymbolGroups;
            includedFilesByDate[mainDateISO] = [mainFile, ...priorFiles.map(e => e.file)];
        }

        // const customiseDateFormat = []
        // const customiseDate = mainDates
        // for (let formateDateChange of customiseDate) {
        //     const mainDateISO = `${formateDateChange.slice(0, 4)}-${formateDateChange.slice(4, 6)}-${formateDateChange.slice(6)}`;
        //     customiseDateFormat.push(mainDateISO)
        // }

        return res.status(200).json({
            status: true,
            overallAverage: symbolGroups,
            messages,
            alerts,
            dateAverages,
            includedFilesByDate,
            // mainDateISO: customiseDateFormat,
            mergedData: allRows
        });

    } catch (error) {
        console.error('Error in rolling comparison', error);
        return res.status(500).json({ error: 'Server error' });
    }
};


