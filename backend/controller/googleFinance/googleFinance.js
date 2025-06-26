const readerFileService = require('../../services/fileReadingServices');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const csv = require('csv-parser');
const papa = require('papaparse');
const { io } = require('../../colorInfo');

const yahooFinance = require('yahoo-finance2').default;

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

// const addLiveNSEStockNames = async (req, res) => {
//     const { stockNames } = req.body
//     const relativePath = '../uploads/liveData';
//     try {
//         const folderCreationStatus = await readerFileService.createFolderIfNotExists(relativePath);

//         if (!folderCreationStatus.success) {
//             return {
//                 success: false,
//                 message: folderCreationStatus.message || 'Folder creation failed',
//             };
//         }

//         const fileName = 'liveData.csv';
//         const filePath = path.join(folderCreationStatus.fullPath, fileName);

//         const isNewFile = !fs.existsSync(filePath);

//         let existingStockNames = [];

//         // Read file and collect existing stock names
//         if (!isNewFile) {
//             const fileContent = fs.readFileSync(filePath, 'utf-8');
//             const lines = fileContent.trim().split('\n');
//             existingStockNames = lines.slice(1).map(line => line.trim().toUpperCase()); // skip header
//         }

//         if (existingStockNames.includes(stockName.toUpperCase())) {
//             return {
//                 success: false,
//                 message: `Duplicate stock name "${stockName}" — not added again.`,
//             };
//         }

//         const newLine = isNewFile ? `StockName\n${stockName}\n` : `${stockName}\n`;
//         fs.appendFileSync(filePath, newLine);

//         const result = {
//             success: true,
//             message: 'Stock name saved successfully',
//             filePath,
//             data: { stockName }
//         };
//         res.status(result.success ? 200 : 500).json(result);

//     } catch (err) {
//         return {
//             success: false,
//             message: 'Internal server error',
//             error: err.message
//         };
//     }
// };

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

exports.fetchAndSortLiveNSEData = async () => {
    const folderPath = path.join(__dirname, `../../uploads/liveData`);
    const files = await fsp.readdir(folderPath);
    const csvFiles = files.filter(f => f.endsWith('.csv'));
    const readPromises = csvFiles.map(file =>
        fsp.readFile(path.join(folderPath, file), 'utf8')
    );
    const fileContents = await Promise.all(readPromises);

    let allRows = [];
    fileContents.forEach((content) => {
        const parsed = papa.parse(content.trim(), {
            header: true,
            skipEmptyLines: true
        });
        const cleanedRows = parsed.data.map(row => {
            const cleaned = {};
            Object.keys(row).forEach(key => {
                cleaned[key.trim()] = row[key];
            });
            return cleaned;
        });
        allRows = allRows.concat(cleanedRows);
    });

    const results = [];

    for (const name of allRows) {
        const symbol = `${name?.StockName.trim().toUpperCase()}.NS`;
        try {
            const data = await yahooFinance.quote(symbol);
            const volume = data.regularMarketVolume || 0;
            const avgVolume = data.averageDailyVolume10Day || 1;
            const volumePercent = ((volume / avgVolume) * 100).toFixed(2);
            results.push({
                stockName: name?.StockName.trim(),
                regularMarketVolume: volume,
                averageDailyVolume10Day: avgVolume,
                volumePercent: Number(volumePercent)
            });
        } catch (stockErr) {
            console.error(`❌ Error fetching data for ${symbol}:`, stockErr.message);
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
};

exports.getNSELiveData = async (req, res) => {
    try {
        const sortedResults = await fetchAndSortLiveNSEData();
        return res.status(200).json(sortedResults);
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


// exports.getNSELiveData = async (req, res) => {
//     try {
//         const folderPath = path.join(__dirname, `../../uploads/liveData`);
//         const files = await fsp.readdir(folderPath); // Use promise version
//         const csvFiles = files.filter(f => f.endsWith('.csv'));
//         // Read all CSV files in parallel
//         const readPromises = csvFiles.map(file =>
//             fsp.readFile(path.join(folderPath, file), 'utf8') // Properly awaited
//         );
//         const fileContents = await Promise.all(readPromises);
//         let allRows = [];
//         fileContents.forEach((content) => {
//             const parsed = papa.parse(content.trim(), {
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
//         // const result = { length: allRows.length, success: true, data: allRows };
//         const results = [];

//         for (const name of allRows) {
//             const symbol = `${name?.StockName.trim().toUpperCase()}.NS`; // Assume NSE

//             try {
//                 // Step 2: Fetch quote data from Yahoo Finance
//                 const data = await yahooFinance.quote(symbol);

//                 // Step 3: Calculate volume percentage
//                 const volume = data.regularMarketVolume || 0;
//                 const avgVolume = data.averageDailyVolume10Day || 1; // avoid divide by 0
//                 const volumePercent = ((volume / avgVolume) * 100).toFixed(2);

//                 results.push({
//                     stockName: name?.StockName.trim(),
//                     regularMarketVolume: volume,
//                     averageDailyVolume10Day: avgVolume,
//                     volumePercent: Number(volumePercent)
//                 });

//             } catch (stockErr) {
//                 console.error(`❌ Error fetching data for ${symbol}:`, stockErr.message);
//             }
//         }

//         const sortedResults = results.sort((a, b) => {
//             const getPriority = (val) => {
//                 const num = Number(val);
//                 if (isNaN(num)) return 999; // Put invalid/missing at end
//                 if (num >= 60) return 1;     // Green
//                 if (num > 30 && num < 60) return 2; // Orange
//                 if (num <= 30) return 3;     // Red
//                 return 999;
//             };

//             return getPriority(a.volumePercent) - getPriority(b.volumePercent);
//         })

//         console.log(sortedResults)

//         io.emit('liveStockData', sortedResults); // Push to all connected clients

//         return res.status(200).json(sortedResults)

//     } catch (err) {
//         console.error('Error in getNSELiveData:', err);
//         return res.status(500).json({
//             success: false,
//             message: 'Unexpected error in getNSELiveData',
//             error: err.message
//         });
//     }
// };


