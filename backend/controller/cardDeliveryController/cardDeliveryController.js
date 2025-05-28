const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const Papa = require('papaparse');
const csvParser = require('csv-parser');
const readerFileService = require('../../services/fileReadingServices');

exports.getDeliveryStats__first = async (req, res) => {
    try {
        const folderPath = path.join(__dirname, '../../uploads/csvfilefolder');
        const files = await fsp.readdir(folderPath);

        const csvFiles = files.filter(file => file.match(/^date_\d{8}\.csv$/));

        const allRows = [];

        for (const file of csvFiles) {
            const content = await fsp.readFile(path.join(folderPath, file), 'utf8');
            const parsed = Papa.parse(content.trim(), {
                header: true,
                skipEmptyLines: true,
            });

            const rows = parsed.data.map(row => {
                const cleaned = {};
                Object.keys(row).forEach(key => {
                    cleaned[key.trim()] = row[key];
                });
                cleaned.SOURCE_FILE = file;
                return cleaned;
            });

            allRows.push(...rows);
        }

        const symbolGroups = {};

        for (const row of allRows) {
            const symbol = row.SYMBOL?.trim();
            if (!symbol) continue;

            if (!symbolGroups[symbol]) {
                symbolGroups[symbol] = {
                    DELIV_QTY_total: 0,
                    count: 0,
                    lastFileRow: null,
                };
            }

            symbolGroups[symbol].DELIV_QTY_total += (+row.DELIV_QTY || 0);
            symbolGroups[symbol].count += 1;

            // Update last row by file date (latest)
            if (
                !symbolGroups[symbol].lastFileRow ||
                row.SOURCE_FILE > symbolGroups[symbol].lastFileRow.SOURCE_FILE
            ) {
                symbolGroups[symbol].lastFileRow = row;
            }
        }

        const higher = [];
        const lower = [];

        for (const symbol in symbolGroups) {
            const group = symbolGroups[symbol];
            const avg = group.DELIV_QTY_total / group.count;
            const lastQty = group.lastFileRow.DELIV_QTY || 0;

            const percentChange = avg ? ((lastQty - avg) / avg) * 100 : 0;
            const direction = percentChange >= 0 ? 'higher' : 'lower';
            const msg = `${symbol}: ${percentChange.toFixed(2)}% ${direction} than average`;

            const card = {
                symbol,
                change: percentChange.toFixed(2) + '%',
                current: lastQty,
                average: avg.toFixed(2),
                message: msg,
            };

            if (percentChange > 0) {
                higher.push(card);
            } else if (percentChange < 0) {
                lower.push(card);
            }
        }

        res.status(200).json({
            status: true,
            higher,
            lower
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Controller: Compare latest file with 10-day average
exports.getDeliveryStats = async (req, res) => {
    try {
        const folderPath = path.join(__dirname, '../../uploads/csvfilefolder');
        const allFiles = await fsp.readdir(folderPath);
        const csvFiles = allFiles.filter(file => file.match(/^date_\d{8}\.csv$/));


        // Extract Date object from filename like 'date_05052025.csv'
        function extractDate(csvFile) {
            const match = csvFile.match(/date_(\d{2})(\d{2})(\d{4})\.csv/);
            if (match) {
                const [_, dd, mm, yyyy] = match;
                return new Date(`${yyyy}-${mm}-${dd}`);
            }
            return null;
        }

        // Read a CSV file and return parsed data
        function readCSVFile(filePath) {
            return new Promise((resolve, reject) => {
                const result = [];
                fs.createReadStream(filePath)
                    .pipe(csvParser({
                        mapHeaders: ({ header }) => header.trim().toUpperCase().replace(/\s+/g, '_') // normalize
                    }))
                    .on('data', data => result.push(data))
                    .on('end', () => resolve(result))
                    .on('error', err => reject(err));
            });
        }

        // Calculate average DELIV_QTY for each symbol
        function aggregateAverage(data) {
            const sum = {};
            const count = {};

            data.forEach((row, idx) => {
                const symbol = (row.SYMBOL || row.symbol || '').trim();
                const rawQty = (row.DELIV_QTY || row.deliv_qty || '').toString().replace(/,/g, '').trim();

                const qty = parseFloat(rawQty);

                if (!symbol || isNaN(qty)) {
                    // console.warn(`Row ${idx} skipped — SYMBOL: "${row.SYMBOL}", DELIV_QTY: "${row.DELIV_QTY}"`);
                    return;
                }
                if (!sum[symbol]) {
                    sum[symbol] = 0;
                    count[symbol] = 0;
                }
                sum[symbol] += qty;
                count[symbol] += 1;
            });

            const avg = {};
            for (let symbol in sum) {
                avg[symbol] = count[symbol] > 0 ? sum[symbol] / count[symbol] : 0;
            }
            return avg;
        }


        const fileList = csvFiles.map(file => ({
            filename: file,
            date: extractDate(file)
        }))
            .filter(f => f.date !== null)
            .sort((a, b) => b.date - a.date); // newest first

        if (fileList.length < 2) {
            return res.status(404).send({ status: false, message: 'Not enough files to compare.' });
        }

        const todayFile = fileList[0];
        const previousFiles = fileList.slice(1, 6);

        const todayData = await readCSVFile(path.join(folderPath, todayFile.filename));

        const prevData = [];
        for (const file of previousFiles) {
            const content = await readCSVFile(path.join(folderPath, file.filename));
            prevData.push(...content);
        }

        const avgQtyMap = aggregateAverage(prevData);
        const higher = [];
        const lower = [];

        todayData.forEach(row => {
            const symbol = (row.SYMBOL || '').trim();
            const todayQty = parseFloat((row.DELIV_QTY || '0').replace(/,/g, '').trim()) || 0;
            const avgQty = avgQtyMap[symbol] || 0;

            if (avgQty === 0) return; // skip undefined averages

            const percentChange = ((todayQty - avgQty) / avgQty) * 100;
            const status = percentChange > 0 ? 'higher' : 'lower';

            const data = {
                symbol,
                current: todayQty,
                average: avgQty.toFixed(2),
                change: percentChange.toFixed(2) + '%',
                message: `${symbol}: ${Math.abs(percentChange).toFixed(2)}% ${status} than average`
            };
            if (!isNaN(percentChange)) {
                if (percentChange > 400) {
                    higher.push(data);
                } else if (percentChange < 0) {
                    lower.push(data);
                }
            }
        });

        const deduplicateBySymbol = (arr) => {
            const seen = new Set();
            return arr.filter(item => {
                if (seen.has(item.symbol)) return false;
                seen.add(item.symbol);
                return true;
            });
        };

        res.status(200).json({
            status: true,
            fileCompared: todayFile.filename,
            whichFile: previousFiles,
            // higher,
            // lower
            higher: deduplicateBySymbol(higher),
            lower: deduplicateBySymbol(lower),
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error', error: err.message });
    }
};



function readCSVFile(filePath) {
    return new Promise((resolve, reject) => {
        const result = [];
        fs.createReadStream(filePath)
            .pipe(csvParser({
                mapHeaders: ({ header }) => header.trim().toUpperCase().replace(/\s+/g, '_')
            }))
            .on('data', data => result.push(data))
            .on('end', () => resolve(result))
            .on('error', err => reject(err));
    });
}

async function getDeliveryStats_DailySpurtsData() {
    const folderPath = path.join(__dirname, '../../uploads/csvfilefolder');
    const allFiles = await fsp.readdir(folderPath);
    const csvFiles = allFiles.filter(file => file.match(/^date_\d{8}\.csv$/));

    function extractDate(csvFile) {
        const match = csvFile.match(/date_(\d{2})(\d{2})(\d{4})\.csv/);
        if (match) {
            const [_, dd, mm, yyyy] = match;
            return new Date(`${yyyy}-${mm}-${dd}`);
        }
        return null;
    }

    function aggregateAverage(data) {
        const sum = {};
        const count = {};

        data.forEach(row => {
            const symbol = (row.SYMBOL || row.symbol || '').trim();

            if (!row.SYMBOL || row.SERIES?.trim() !== 'EQ') return null; // Adding

            const rawQty = (row.DELIV_QTY || row.deliv_qty || '').toString().replace(/,/g, '').trim();
            const qty = parseFloat(rawQty);
            if (!symbol || isNaN(qty)) return;

            if (!sum[symbol]) {
                sum[symbol] = 0;
                count[symbol] = 0;
            }
            sum[symbol] += qty;
            count[symbol] += 1;
        });

        const avg = {};
        for (let symbol in sum) {
            avg[symbol] = count[symbol] > 0 ? sum[symbol] / count[symbol] : 0;
        }
        return avg;
    }

    const fileList = csvFiles.map(file => ({
        filename: file,
        date: extractDate(file)
    }))
        .filter(f => f.date !== null)
        .sort((a, b) => b.date - a.date);

    if (fileList.length < 2) {
        throw new Error('Not enough files to compare.');
    }

    const todayFile = fileList[0];
    const previousFiles = fileList.slice(1, 6);

    const todayData = await readCSVFile(path.join(folderPath, todayFile.filename));
    const prevData = [];
    for (const file of previousFiles) {
        const content = await readCSVFile(path.join(folderPath, file.filename));
        prevData.push(...content);
    }

    const avgQtyMap = aggregateAverage(prevData);
    const higher = [];
    const lower = [];

    todayData.forEach(row => {
        const symbol = (row.SYMBOL || '').trim();
        const todayQty = parseFloat((row.DELIV_QTY || '0').replace(/,/g, '').trim()) || 0;
        const avgQty = avgQtyMap[symbol] || 0;
        if (avgQty === 0) return;

        const percentChange = ((todayQty - avgQty) / avgQty) * 100;
        // const status = percentChange > 0 ? 'higher' : 'lower';

        const data = {
            symbol,
            current: todayQty,
            average: avgQty.toFixed(2),
            percentChanges: percentChange.toFixed(2) + '%',
            // message: `${symbol}: ${Math.abs(percentChange).toFixed(2)}% ${status} than average`
        };

        if (!isNaN(percentChange)) {
            if (percentChange > 400) {
                higher.push(data);
            } else if (percentChange < 0) {
                lower.push(data);
            }
        }
    });

    const deduplicateBySymbol = (arr) => {
        const seen = new Set();
        return arr.filter(item => {
            if (seen.has(item.symbol)) return false;
            seen.add(item.symbol);
            return true;
        });
    };

    return {
        status: true,
        // fileCompared: todayFile.filename,
        // whichFile: previousFiles,
        higher: deduplicateBySymbol(higher),
        // lower: deduplicateBySymbol(lower)
    };
}

const getDeliveryStats_AllCap = async (cap) => {
    const capKey = cap?.toUpperCase();
    try {
        const data = await readerFileService.mergeCSVFile(capKey);

        function cleanKeyDynamic(key) {
            return key
                .replace(/<[^>]*>/g, '')        // Remove <br>, <span>, etc.
                .replace(/%/g, 'Percent')       // Replace % with Percent
                .replace(/[^a-zA-Z0-9 ]/g, '')  // Remove special chars except spaces
                .trim()
                .split(' ')
                .map((word, index) =>
                    index === 0
                        ? word.toLowerCase()
                        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join('');
        }

        function cleanKeys(record) {
            const cleaned = {};
            for (const key in record) {
                const newKey = cleanKeyDynamic(key);
                cleaned[newKey || key] = record[key];
            }
            return cleaned;
        }

        function getWeight(percentageStr) {
            if (typeof percentageStr === 'string' && percentageStr.trim().toLowerCase() === 'new') {
                return 1;
            }

            const percent = parseFloat(percentageStr);
            if (isNaN(percent)) return 0;

            if (percent < 0) {
                const absPercent = Math.abs(percent);
                if (absPercent > 100) return -6;
                if (absPercent > 80) return -5;
                if (absPercent > 60) return -4;
                if (absPercent > 40) return -3;
                if (absPercent > 20) return -2;
                return -1;
            }

            if (percent > 100) return 6;
            if (percent > 80) return 5;
            if (percent > 60) return 4;
            if (percent > 40) return 3;
            if (percent > 20) return 2;
            if (percent > 0) return 1;

            return 0;
        }

        const monthsHeaderSet = new Set();
        const stockMap = new Map();

        data.data?.forEach((item) => {
            const modifiedKey = cleanKeys(item);

            Object.keys(modifiedKey).forEach((key) => {
                const match = key.match(/^valueAsOf(\d*)([A-Za-z]+)(\d{4})$/);
                if (match) {
                    const month = match[2];
                    const year = match[3].slice(2);
                    const label = `${month}-${year}`;
                    monthsHeaderSet.add(label);
                }
            });

            const keyName = modifiedKey.investedIn?.trim();

            if (keyName) {
                const stockKey = keyName.toLowerCase();
                const existing = stockMap.get(stockKey) || { stockName: keyName };

                Object.keys(modifiedKey).forEach((key) => {
                    const match = key.match(/^valueAsOf(\d*)([A-Za-z]+)(\d{4})$/);
                    if (match) {
                        const month = match[2];
                        const year = match[3].slice(2);
                        const formattedMonth = `${month}${year}`;

                        const weight = getWeight(modifiedKey.monthChangeInSharesPercent);
                        const numericWeight = typeof weight === 'number' ? weight : 0;

                        const existingValue = existing[formattedMonth];
                        if (existingValue === 'New') {
                            existing[formattedMonth] = 'New';
                        } else {
                            existing[formattedMonth] = (typeof existingValue === 'number' ? existingValue : 0) + numericWeight;
                        }
                    }
                });

                stockMap.set(stockKey, existing);
            }
        });

        const monthsHeader = Array.from(monthsHeaderSet);
        const allMonthKeys = monthsHeader.map(m => m.replace('-', ''));

        for (const stock of stockMap.values()) {
            for (const monthKey of allMonthKeys) {
                if (!(monthKey in stock)) {
                    stock[monthKey] = '-';
                }
            }
        }

        // const filteredStocks = Array.from(stockMap.values()).filter(stock => {
        //     const hasAllMonths = allMonthKeys.every(month => stock[month] !== '-');
        //     const totalWeight = allMonthKeys.reduce((sum, month) => {
        //         const val = stock[month];
        //         return typeof val === 'number' ? sum + val : sum;
        //     }, 0);

        //     return hasAllMonths && totalWeight > 5;
        // });

        const filteredStocks = Array.from(stockMap.values()).filter(stock => {
            return monthsHeader.every(header => {
                const key = header.replace('-', '');
                const val = stock[key];
                return typeof val === 'number' && val > 3;
            });
        });


        return {
            status: 200,
            success: true,
            monthsHeader,
            stocks: filteredStocks
        };

    } catch (err) {
        return err;
    }
}

exports.getFundData = async (req, res) => {
    const { type } = req.query;

    if (!type) return 'type is required'

    let data = [];
    switch (type) {
        case 'daily-spurts':
            data = await getDeliveryStats_DailySpurtsData();
            break;
        case 'large-cap':
            data = await getDeliveryStats_AllCap('largecap');
            break;
        case 'mid-cap':
            data = await getDeliveryStats_AllCap('midcap');;
            break;
        case 'small-cap':
            data = await getDeliveryStats_AllCap('smallcap');;
            break;
        default:
            return res.status(400).json({ message: 'Invalid fund type' });
    }

    res.status(200).json({ success: true, data });
};