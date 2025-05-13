const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const Papa = require('papaparse');
const csvParser = require('csv-parser')

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

// Controller: Compare latest file with 10-day average
exports.getDeliveryStats = async (req, res) => {
    try {
        const folderPath = path.join(__dirname, '../../uploads/csvfilefolder');
        const allFiles = await fsp.readdir(folderPath);
        const csvFiles = allFiles.filter(file => file.match(/^date_\d{8}\.csv$/));

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