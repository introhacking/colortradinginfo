const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const csv = require('csv-parser');
const papa = require('papaparse');
const readerFileService = require('../../services/fileReadingServices');
const fetch = require('node-fetch');
const XLSX = require('xlsx');
// const { parse } = require('csv-parse/sync');

const yahooFinance = require('yahoo-finance2').default;

yahooFinance.suppressNotices(['yahooSurvey']);

exports.getNSEPrice = async (req, res) => {
    const { symbol } = req.query;

    try {
        if (!symbol) {
            return res.status(400).json({ error: "Symbol is required" });
        }

        // Quote
        const quote = await yahooFinance.quote(`${symbol}.NS`);
        // Chart: last 5 days
        // const history = await yahooFinance.chart(`${symbol}.NS`, {
        //     range: '5d',
        //     interval: '1d'
        // });

        // const sparklineData = history?.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];

        return res.status(200).json({
            ...quote,
            // sparklineData
        });

    } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error.message);
        return res.status(500).json({ error: "Unable to fetch stock data" });
    }
};

exports.addLiveNSEStockName = async (req, res) => {

    const { stockNames } = req.body
    const relativePath = '../uploads/liveData';

    try {
        const folderCreationStatus = await readerFileService.createFolderIfNotExists(relativePath);
        if (!folderCreationStatus.success) {
            return res.status(500).json({
                success: false,
                message: folderCreationStatus.message || 'Folder creation failed',
            });
        }

        const fileName = 'liveData.csv';
        const filePath = path.join(folderCreationStatus.fullPath, fileName);
        const isNewFile = !fs.existsSync(filePath);

        // Normalize input to array
        const stockList = Array.isArray(stockNames) ? stockNames : [stockNames];

        let existingStockNames = [];
        if (!isNewFile) {
            const content = fs.readFileSync(filePath, 'utf-8');
            existingStockNames = content.trim().split('\n').slice(1).map(line => line.trim().toUpperCase());
        }

        const newEntries = stockList
            .map(name => name.trim().toUpperCase())
            .filter(name => !!name && !existingStockNames.includes(name));

        if (newEntries.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No new stock names to add (all are duplicates or empty)',
            });
        }

        const newCSVLines = isNewFile
            ? [`StockName`, ...newEntries].join('\n') + '\n'
            : newEntries.map(name => `${name}`).join('\n') + '\n';

        fs.appendFileSync(filePath, newCSVLines);

        const result = {
            success: true,
            message: newEntries.length === 1
                ? `1 stock name added successfully: ${newEntries[0]}`
                : `${newEntries.length} stock names added successfully.`,
            added: newEntries,
            skipped: stockList.filter(name => !newEntries.includes(name.trim().toUpperCase())),
            filePath,
        };
        res.status(200).json(result)

    } catch (err) {
        console.error('Error in addLiveNSEStockName:', err);
        const result = {
            success: false,
            message: 'Internal server error',
            error: err.message
        };
        return res.status(500).json(result)
    }
};

// exports.fetchAndSortLiveNSEData = async () => {
//     try {
//         const folderPath = path.join(__dirname, `../../uploads/liveData`);

//         // Check if folder exists
//         if (!fs.existsSync(folderPath)) {
//             console.warn('⚠️ Folder does not exist:', folderPath);
//             return []; // or return some default structure
//         }

//         const files = await fsp.readdir(folderPath);
//         const csvFiles = files.filter(f => f.endsWith('.csv'));

//         if (csvFiles.length === 0) {
//             console.warn('⚠️ No CSV files found in:', folderPath);
//             return [];
//         }

//         const readPromises = csvFiles.map(file =>
//             fsp.readFile(path.join(folderPath, file), 'utf8')
//         );
//         const fileContents = await Promise.all(readPromises);

//         let allRows = [];
//         for (const content of fileContents) {
//             const parsed = papa.parse(content.trim(), {
//                 header: true,
//                 skipEmptyLines: true
//             });
//             allRows.push(...parsed.data);
//         }
//         const results = [];

//         for (const name of allRows) {
//             const symbol = `${name?.StockName.trim().toUpperCase()}.NS`;
//             try {
//                 const data = await yahooFinance.quote(symbol);

//                 const currentMarketPrice = data?.regularMarketPrice ?? 0;
//                 const previousMarketClosePrice = data?.regularMarketPreviousClose ?? 0;
//                 const fiftyTwoWeekLow = data?.fiftyTwoWeekLow ?? 0;
//                 const fiftyTwoWeekHigh = data?.fiftyTwoWeekHigh ?? 0;

//                 const regularMarketChange = data?.regularMarketChange ?? 0;
//                 const regularMarketChangePercent = data?.regularMarketChangePercent != null
//                     ? Number(data.regularMarketChangePercent.toFixed(2))
//                     : 0;

//                 const fiftyTwoWeekLowChange = data?.fiftyTwoWeekLowChange ?? 0;
//                 const fiftyTwoWeekLowChangePercent = data?.fiftyTwoWeekLowChangePercent != null
//                     ? Number(data.fiftyTwoWeekLowChangePercent.toFixed(2))
//                     : 0;

//                 const fiftyTwoWeekHighChange = data?.fiftyTwoWeekHighChange ?? 0;
//                 const fiftyTwoWeekHighChangePercent = data?.fiftyTwoWeekHighChangePercent != null
//                     ? Number(data.fiftyTwoWeekHighChangePercent.toFixed(2))
//                     : 0;

//                 const fiftyTwoWeekChangePercent = data?.fiftyTwoWeekChangePercent != null
//                     ? Number(data.fiftyTwoWeekChangePercent.toFixed(2))
//                     : 0;

//                 const regularMarketDayLow = data?.regularMarketDayLow ?? 0;
//                 const regularMarketOpen = data?.regularMarketOpen ?? 0;

//                 const volume = data?.regularMarketVolume ?? 0;
//                 const avgVolume = data?.averageDailyVolume10Day || 1; // Prevent divide-by-zero
//                 const volumePercent = Number(((volume / avgVolume) * 100).toFixed(2));

//                 results.push({
//                     stockName: name?.StockName.trim(),
//                     regularMarketVolume: volume,
//                     averageDailyVolume10Day: avgVolume,
//                     volumePercent,
//                     currentMarketPrice,
//                     previousMarketClosePrice,
//                     fiftyTwoWeekHigh,
//                     fiftyTwoWeekLow,
//                     regularMarketChangePercent,
//                     regularMarketChange,
//                     fiftyTwoWeekLowChange,
//                     fiftyTwoWeekLowChangePercent,
//                     fiftyTwoWeekHighChange,
//                     fiftyTwoWeekHighChangePercent,
//                     fiftyTwoWeekChangePercent,
//                     regularMarketDayLow,
//                     regularMarketOpen
//                 });

//             } catch (stockErr) {
//                 console.error(`❌ Error fetching data for ${symbol}:`, stockErr.message);
//             }
//         }

//         const sortedResults = results.sort((a, b) => {
//             const getPriority = (val) => {
//                 const num = Number(val);
//                 if (isNaN(num)) return 999;
//                 if (num >= 60) return 1;
//                 if (num > 30 && num < 60) return 2;
//                 if (num <= 30) return 3;
//                 return 999;
//             };
//             return getPriority(a.volumePercent) - getPriority(b.volumePercent);
//         });

//         return sortedResults;

//     } catch (err) {
//         console.error('❌ Error in fetchAndSortLiveNSEData:', err.message);
//         throw new Error('Failed to read live stock data.');
//     }
// };


// Retry wrapper

// async function retry(fn, retries = 3, delay = 1500) {
//     for (let i = 0; i < retries; i++) {
//         try {
//             return await fn();
//         } catch (err) {
//             if (i === retries - 1) throw err;
//             await new Promise(res => setTimeout(res, delay * (i + 1)));
//         }
//     }
// }

async function retry(fn, retries = 3, delay = 1500) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err) {
            // console.warn(`⚠️ Retry ${i + 1} failed: ${err.message}`);
            if (i === retries - 1) throw err;
            await new Promise(res => setTimeout(res, delay * (i + 1))); // Exponential backoff
        }
    }
}


exports.fetchAndSortLiveNSEData = async () => {
    try {
        const folderPath = path.join(__dirname, '../../uploads/liveData');

        if (!fs.existsSync(folderPath)) {
            console.warn('⚠️ Folder does not exist:', folderPath);
            return [];
        }

        const files = await fsp.readdir(folderPath);
        const csvFiles = files.filter(file => file.endsWith('.csv'));

        if (csvFiles.length === 0) {
            console.warn('⚠️ No CSV files found in:', folderPath);
            return [];
        }

        const fileContents = await Promise.all(
            csvFiles.map(file => fsp.readFile(path.join(folderPath, file), 'utf8'))
        );

        let allRows = [];
        for (const content of fileContents) {
            const parsed = papa.parse(content.trim(), {
                header: true,
                skipEmptyLines: true
            });
            allRows.push(...parsed.data);
        }

        const results = [];

        for (const name of allRows) {
            const stockName = name?.StockName?.trim();
            if (!stockName) continue;

            const symbol = `${stockName.toUpperCase()}.NS`;

            try {
                // const data = await retry(() => yahooFinance.quote(symbol), 3);

                const data = await retry(() => yahooFinance.quote(symbol, { timeout: 15000 }), 3);

                const currentMarketPrice = data?.regularMarketPrice ?? 0;
                const previousMarketClosePrice = data?.regularMarketPreviousClose ?? 0;
                const fiftyTwoWeekLow = data?.fiftyTwoWeekLow ?? 0;
                const fiftyTwoWeekHigh = data?.fiftyTwoWeekHigh ?? 0;

                const regularMarketChange = data?.regularMarketChange ?? 0;
                const regularMarketChangePercent =
                    data?.regularMarketChangePercent != null
                        ? Number(data.regularMarketChangePercent.toFixed(2))
                        : 0;

                const fiftyTwoWeekLowChange = data?.fiftyTwoWeekLowChange ?? 0;
                const fiftyTwoWeekLowChangePercent =
                    data?.fiftyTwoWeekLowChangePercent != null
                        ? Number(data.fiftyTwoWeekLowChangePercent.toFixed(2))
                        : 0;

                const fiftyTwoWeekHighChange = data?.fiftyTwoWeekHighChange ?? 0;
                const fiftyTwoWeekHighChangePercent =
                    data?.fiftyTwoWeekHighChangePercent != null
                        ? Number(data.fiftyTwoWeekHighChangePercent.toFixed(2))
                        : 0;

                const fiftyTwoWeekChangePercent =
                    data?.fiftyTwoWeekChangePercent != null
                        ? Number(data.fiftyTwoWeekChangePercent.toFixed(2))
                        : 0;

                const regularMarketDayLow = data?.regularMarketDayLow ?? 0;
                const regularMarketOpen = data?.regularMarketOpen ?? 0;

                const volume = data?.regularMarketVolume ?? 0;
                const avgVolume = data?.averageDailyVolume10Day || 1;
                const volumePercent = Number(((volume / avgVolume) * 100).toFixed(2));

                results.push({
                    stockName,
                    regularMarketVolume: volume,
                    averageDailyVolume10Day: avgVolume,
                    volumePercent,
                    currentMarketPrice,
                    previousMarketClosePrice,
                    fiftyTwoWeekHigh,
                    fiftyTwoWeekLow,
                    regularMarketChangePercent,
                    regularMarketChange,
                    fiftyTwoWeekLowChange,
                    fiftyTwoWeekLowChangePercent,
                    fiftyTwoWeekHighChange,
                    fiftyTwoWeekHighChangePercent,
                    fiftyTwoWeekChangePercent,
                    regularMarketDayLow,
                    regularMarketOpen
                });

                // Optional: add delay between requests (e.g., 300ms)
                // await new Promise(res => setTimeout(res, 500));
                await new Promise(res => setTimeout(res, 1000)); // 1 second between requests


            } catch (err) {
                console.error(`❌ Error fetching data for ${symbol}:`, err.message);
            }
        }

        const sortedResults = results.sort((a, b) => {
            const getPriority = (val) => {
                const num = Number(val);
                if (isNaN(num)) return 999;
                if (num >= 60) return 1;
                if (num > 30 && num < 60) return 2;
                if (num <= 30) return 3;
                return 999;
            };
            return getPriority(a.volumePercent) - getPriority(b.volumePercent);
        });

        return sortedResults;

    } catch (err) {
        console.error('❌ Error in fetchAndSortLiveNSEData:', err.message);
        throw new Error('Failed to read live stock data.');
    }
};


exports.getNSELiveData = async (req, res) => {
    try {
        // const sortedResults = await exports.fetchAndSortLiveNSEData();
        // return res.status(200).json(sortedResults);

        // const limit = parseInt(req.query.limit); // ?limit=20

        const limit = Math.max(1, parseInt(req.query.limit) || 20);
        const sortedResults = await exports.fetchAndSortLiveNSEData();

        const limitedResults = !isNaN(limit) ? sortedResults.slice(0, limit) : sortedResults;

        return res.status(200).json(limitedResults);

    } catch (err) {
        console.error('Error in getNSELiveData:', err);
        return res.status(500).json({
            success: false,
            message: 'Unexpected error in getNSELiveData',
            error: err.message
        });
    }
};


exports.deleteStockFromLiveDataCSV = async (req, res) => {
    const { stockName } = req.params
    const csvFilePath = path.join(__dirname, '../../uploads/liveData/liveData.csv');
    try {
        if (!fs.existsSync(csvFilePath)) {
            return { success: false, message: 'CSV file does not exist' };
        }

        const content = fs.readFileSync(csvFilePath, 'utf-8');
        const lines = content.trim().split('\n');
        const header = lines[0];
        const dataRows = lines.slice(1);

        const updatedRows = dataRows.filter(
            row => row.trim().toUpperCase() !== stockName.trim().toUpperCase()
        );

        if (updatedRows.length === dataRows.length) {
            return res.status(400).json({ success: false, message: `Stock "${stockName}" not found in CSV.` });
        }

        const newCSVContent = [header, ...updatedRows].join('\n');
        fs.writeFileSync(csvFilePath, newCSVContent);

        const result = { success: true, message: `Stock "${stockName}" deleted from CSV.` };
        return res.status(200).json(result)

    } catch (err) {
        console.error('❌ Error deleting stock:', err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
};



//  [ LIVE EXCEL SHEET CONNECT ]
// Cache sheet config
const sheetSessions = {}; // You can use Redis instead if needed

exports.liveExcelSheetConnect = async (req, res) => {
    const url = typeof req.body.excelUrl === 'string'
        ? req.body.excelUrl
        : req.body.excelUrl?.url;

    // ✅ Extract gid (if present), fallback to 0
    const gidMatch = url.match(/gid=([0-9]+)/);
    const gids = gidMatch ? [gidMatch[1]] : [0];

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing URL' });
    }

    try {
        if (url.includes('docs.google.com/spreadsheets')) {
            const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
            if (!match) return res.status(400).json({ error: 'Invalid Google Sheet URL' });

            const sheetId = match[1];
            sheetSessions['latestSheet'] = { sheetId, gids }; // Save for refresh

            const allSheets = await fetchGoogleSheets(sheetId, gids);

            return res.json({ sheets: allSheets });
        } else {
            return res.status(400).json({ error: 'Unsupported URL format' });
        }
    } catch (err) {
        console.error('Excel fetch error:', err);
        res.status(500).json({ error: 'Failed to load or parse file' });
    }
};

exports.refreshExcel = async (req, res) => {
    const config = sheetSessions['latestSheet'];
    if (!config) return res.status(400).json({ error: 'No previous sheet session found' });

    try {
        const allSheets = await fetchGoogleSheets(config.sheetId, config.gids);
        return res.json({ sheets: allSheets });
    } catch (err) {
        console.error('Excel refresh error:', err);
        res.status(500).json({ error: 'Failed to refresh data' });
    }
};

async function fetchGoogleSheets(sheetId, gids) {
    let allSheets = {};

    for (const gid of gids) {
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

        const response = await fetch(csvUrl);
        if (!response.ok) {
            console.warn(`Failed to fetch gid ${gid}`);
            continue;
        }

        const csvText = await response.text();
        const workbook = XLSX.read(csvText, { type: 'string' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        allSheets[`Sheet_gid_${gid}`] = {
            data: jsonData,
            columns: Object.keys(jsonData[0] || {}).map(col => ({
                headerName: col,
                field: col,
                sortable: true,
                filter: true
            }))
        };
    }

    return allSheets;
}





// (async () => {
//   const url = 'https://netorgft12450213-my.sharepoint.com/:x:/r/personal/manish_gupta_avgna_com/_layouts/15/doc2.aspx?sourcedoc=%7BCD3D91E5-7FBC-4C2E-9B46-EA0FF311CD9B%7D&file=EMIRATES%20_Version1_updated.xlsx&action=default&mobileredirect=true&DefaultItemOpen=1&ct=1751030663152&wdOrigin=OFFICECOM-WEB.START.EDGEWORTH&cid=80dcca05-707b-4e60-b1bc-d2d4d05063e2&wdPreviousSessionSrc=HarmonyWeb&wdPreviousSession=820b2c4f-0092-4e55-8fb9-68c201733506';
//   const res = await fetch(url);
//   console.log('Status:', res.status);
//   const buffer = await res.arrayBuffer();
//   fs.writeFileSync('output.xlsx', Buffer.from(buffer));
// })();

