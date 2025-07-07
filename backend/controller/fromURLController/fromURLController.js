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


