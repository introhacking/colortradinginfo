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
            higher: deduplicateBySymbol(higher),
            lower: deduplicateBySymbol(lower),
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error', error: err.message });
    }
};

const getDeliveryStats_DailySpurtsData = async (to_date) => {
    try {
        if (!to_date) return {};

        const folderPath = path.join(__dirname, '../../uploads/csvfilefolder');

        const formatDate = (dateString) => {
            const [year, month, day] = dateString.split('-');
            return `${year}${month}${day}`;
        };

        const toDateFormatted = formatDate(to_date);

        const files = await fsp.readdir(folderPath);
        const dateFiles = files
            .filter(file => /^date_\d{8}\.csv$/.test(file))
            .map(file => {
                const rawDate = file.match(/^date_(\d{8})\.csv$/)[1];
                const day = rawDate.slice(0, 2);
                const month = rawDate.slice(2, 4);
                const year = rawDate.slice(4, 8);
                const formatted = `${year}${month}${day}`;
                return { file, rawDate, formatted };
            })
            .sort((a, b) => b.formatted.localeCompare(a.formatted));

        const allDates = dateFiles.map(f => f.formatted);
        const toIndex = allDates.indexOf(toDateFormatted);
        if (toIndex === -1) {
            console.warn('Selected to_date not found in filenames:', toDateFormatted);
            return { status: true, data: {} };
        }

        const mainDates = allDates.slice(toIndex, toIndex + 5);
        const results = {};
        const symbolCount = {};

        for (const mainDate of mainDates) {
            const prevDates = allDates.filter(d => d < mainDate).slice(0, 5);
            if (prevDates.length < 5) continue;

            const mainFile = dateFiles.find(f => f.formatted === mainDate)?.file;
            if (!mainFile) continue;

            const mainCSV = await fsp.readFile(path.join(folderPath, mainFile), 'utf8');
            const mainParsed = Papa.parse(mainCSV, {
                header: true,
                skipEmptyLines: true,
                transformHeader: h => h.trim()
            }).data;

            const mainData = mainParsed.filter(r => r.SERIES?.trim().toUpperCase() === 'EQ');

            const avgStats = {};

            for (const prevDate of prevDates) {
                const prevFile = dateFiles.find(f => f.formatted === prevDate)?.file;
                if (!prevFile) continue;

                const content = await fsp.readFile(path.join(folderPath, prevFile), 'utf8');
                const parsed = Papa.parse(content, {
                    header: true,
                    skipEmptyLines: true,
                    transformHeader: h => h.trim()
                }).data.filter(r => r.SERIES?.trim().toUpperCase() === 'EQ');

                for (const row of parsed) {
                    const sym = row.SYMBOL?.trim();
                    if (!sym) continue;

                    if (!avgStats[sym]) avgStats[sym] = { deliv: 0, trade: 0, count: 0 };
                    avgStats[sym].deliv += Number(row.DELIV_QTY || 0);
                    avgStats[sym].trade += Number(row.TTL_TRD_QNTY || 0);
                    avgStats[sym].count += 1;
                }
            }

            for (const row of mainData) {
                const sym = row.SYMBOL?.trim();
                const deliv = Number(row.DELIV_QTY || 0);
                const trade = Number(row.TTL_TRD_QNTY || 0);
                const avg = avgStats[sym];

                if (!sym || !avg || avg.count < 5) continue;

                // if (sym === 'Axis Bank Ltd') {
                //     console.log(`${mainDate} Axis Bank Ltd: avgDeliv=${avgDeliv}, todayDeliv=${deliv}, delivPct=${delivPct}`);
                // }

                const avgDeliv = avg.deliv / avg.count;
                const avgTrade = avg.trade / avg.count;

                const delivPct = avgDeliv > 0 ? ((deliv - avgDeliv) / avgDeliv) * 100 : 0;
                const tradePct = avgTrade > 0 ? ((trade - avgTrade) / avgTrade) * 100 : 0;

                if (delivPct > 300 && tradePct > 300) {
                    const dateKey = `${mainDate.slice(6, 8)}/${mainDate.slice(4, 6)}/${mainDate.slice(0, 4)}`;
                    if (!results[sym]) results[sym] = {};
                    results[sym][dateKey] = {
                        DELIV_QTY_avg: Math.round(avgDeliv),
                        DELIV_QTY_percent: delivPct.toFixed(2) + '%',
                        TTL_TRD_QNTY_avg: Math.round(avgTrade),
                        TTL_TRD_QNTY_percent: tradePct.toFixed(2) + '%'
                    };
                    symbolCount[sym] = (symbolCount[sym] || 0) + 1;
                }
            }
        }

        // Filter for symbols that appeared 2+ times
        const dateAverages = {};
        for (const sym in results) {
            if (symbolCount[sym] >= 2) {
                dateAverages[sym] = results[sym];
            }
        }
        return {
            status: true,
            dateAverages: dateAverages
        };

    } catch (error) {
        console.error('Error in rolling comparison', error);
        return { status: 500, error: 'Server error' };
    }
};


const cache = new Map();
const getDeliveryStats_AllCap = async (cap) => {

    const capKey = cap?.toUpperCase();

    if (cache.has(capKey)) {
        return cache.get(capKey);
    }
    try {
        const data = await readerFileService.getMasterMergeCSVFileBasedUponCaps(capKey);

        const { monthsHeader, modifiedKeyRecord, newModifiedKeyRecord } = data

        function getScore(stock, monthKeys) {
            let values = monthKeys.map(month => stock[month]);

            if (values.some(v => typeof v === 'number' && v < 0)) return 0;

            // 1. Check if all values > 5
            const allAbove5 = values.every(val => typeof val === 'number' && val > 4);
            if (allAbove5) return 3;

            // 2. Check for at least 2 continuous values > 5
            let streak = 0;
            for (const val of values) {
                if (typeof val === 'number' && val > 4) {
                    streak += 1;
                    if (streak >= 2) return 2;
                } else {
                    streak = 0;
                }
            }

            // 3. Others
            return 1;
        }


        // // Apply filtering and sorting
        // const filteredStocks = newModifiedKeyRecord
        //     .filter(stock => monthKeys.some(month => typeof stock[month] === 'number'))
        //     .sort((a, b) => getScore(b, monthKeys) - getScore(a, monthKeys));

        function monthStringToDate(str) {
            const monthMap = {
                Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
                Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
            };

            const match = str.match(/^([A-Za-z]{3})(\d{2})$/);
            if (!match) return new Date(0);

            const [_, monStr, yearStr] = match;
            const month = monthMap[monStr];
            const year = 2000 + parseInt(yearStr); // Assumes year like 25 → 2025
            return new Date(year, month);
        }


        // Format month keys correctly: ['Apr25', 'May25', 'Mar25']
        const monthKeys = monthsHeader.map(m => m.replace('-', '')).sort((a, b) => monthStringToDate(a) - monthStringToDate(b));


        // ✅ Filter stocks with any month's weight > 5
        const latestMonthKey = monthKeys[monthKeys.length - 1]; // May25

        const filteredStocks = newModifiedKeyRecord
            .filter(stock => typeof stock[latestMonthKey] === 'number' && stock[latestMonthKey] > 5)
            .sort((a, b) => getScore(b, monthKeys) - getScore(a, monthKeys));




        // const filteredStocks = newModifiedKeyRecord

        const result = {
            status: 200,
            success: true,
            monthsHeader,
            stocks: filteredStocks
        };

        cache.set(capKey, result);
        return result

    } catch (err) {
        return err;
    }
}

const getCombineDeliveryStats_AllCapAndDaily = async () => {
    try {
        const caps = ['LARGECAP', 'MIDCAP', 'SMALLCAP'];

        if (cache.has('combineCaps_Daily')) {
            return cache.get('combineCaps_Daily');
        }

        const stockMaps = [];
        const monthsHeaderSet = new Set();

        const dailyPath = path.join(__dirname, '../../uploads/csvfilefolder');

        // Converts % change into weight
        function getWeight(percentageStr) {
            if (typeof percentageStr === 'string' && percentageStr.trim().toLowerCase() === 'new') return 1;
            const percent = parseFloat(percentageStr);
            if (isNaN(percent)) return 0;

            if (percent < 0) {
                const abs = Math.abs(percent);
                if (abs > 100) return -6;
                if (abs > 80) return -5;
                if (abs > 60) return -4;
                if (abs > 40) return -3;
                if (abs > 20) return -2;
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

        // Read and normalize all caps files
        for (const cap of caps) {
            const { success, newModifiedKeyRecord, modifiedKeyRecord, monthsHeader } = await readerFileService.getMasterMergeCSVFileBasedUponCaps(cap);
            if (!success) continue;

            monthsHeader.forEach(m => monthsHeaderSet.add(m));
            const stockMap = new Map();

            modifiedKeyRecord?.forEach(modifiedKey => {
                const keyName = modifiedKey.nseCode?.trim();
                if (!keyName) return;

                const stockKey = keyName.toLowerCase();
                const existing = stockMap.get(stockKey) || { stockName: keyName };
                // const existing = stockMap.get(stockKey) || { stockName: keyName, nseCode: keyName };

                Object.keys(modifiedKey).forEach(key => {
                    const match = key.match(/^valueAsOf(\d*)([A-Za-z]+)(\d{4})$/);
                    if (match) {
                        const month = match[2];
                        const year = match[3].slice(2);
                        const formattedMonth = `${month}${year}`;
                        const percentStr = modifiedKey.monthChangeInSharesPercent || '';
                        const weight = getWeight(percentStr);

                        const existingValue = existing[formattedMonth];
                        if (existingValue === 'New') {
                            existing[formattedMonth] = 'New';
                        } else {
                            existing[formattedMonth] = (typeof existingValue === 'number' ? existingValue : 0) + weight;
                        }
                    }
                });

                stockMap.set(stockKey, existing);
            });

            stockMaps.push(stockMap);
        }

        const allMonthKeys = Array.from(monthsHeaderSet).map(m => m.replace('-', ''));
        const allStockNames = stockMaps.map(map => new Set([...map.keys()]));
        const commonStocks = [...allStockNames[0]].filter(name => allStockNames.every(set => set.has(name)));

        const filteredStocks = [];

        for (const stockKey of commonStocks) {
            const baseStock = stockMaps[0].get(stockKey);
            const mergedStock = { stockName: baseStock.stockName };
            // const mergedStock = { stockName: baseStock.stockName, nseCode: baseStock.nseCode };
            let grandTotal = 0;

            for (const month of allMonthKeys) {
                let totalWeight = 0;

                for (const map of stockMaps) {
                    const stock = map.get(stockKey);
                    const weight = stock?.[month];
                    if (typeof weight === 'number') {
                        totalWeight += weight;
                    }
                }

                mergedStock[month] = totalWeight > 4 ? totalWeight : null;
                if (totalWeight > 4) grandTotal += totalWeight;
            }

            if (grandTotal > 4) filteredStocks.push(mergedStock);
        }

        // Normalize utility
        function normalizeSymbol(name) {
            return name?.replace(/\s+/g, '').toUpperCase();
        }

        // CSV utilities
        async function readCSVFile(filePath) {
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

        async function readCSVFolder(folderPath) {
            const files = fs.readdirSync(folderPath)
                .filter(file => file.endsWith('.csv'))
                .map(file => ({
                    name: file,
                    time: fs.statSync(path.join(folderPath, file)).mtime.getTime()
                }))
                .sort((a, b) => b.time - a.time)
                .slice(0, 30)
                .map(file => file.name);

            let allData = [];
            for (const file of files) {
                const filePath = path.join(folderPath, file);
                const fileData = await readCSVFile(filePath);
                allData = allData.concat(fileData);
            }
            return allData;
        }

        // Daily spurt analysis
        const dailyData = await readCSVFolder(dailyPath);
        const filteredSymbols = new Set(filteredStocks.map(stock => normalizeSymbol(stock.stockName)));
        // const filteredSymbols = new Set(filteredStocks.map(stock => normalizeSymbol(stock.nseCode)));

        const avgStats = {};
        const results = {};
        const symbolCount = {};

        // First Pass: Average Calculation
        dailyData?.forEach(item => {
            const symbol = normalizeSymbol(item.SYMBOL);
            if (!symbol || !filteredSymbols.has(symbol)) return;

            const deliv = Number(item.DELIV_QTY || 0);
            const trade = Number(item.TTL_TRD_QNTY || 0);

            if (!avgStats[symbol]) {
                avgStats[symbol] = { deliv: 0, trade: 0, count: 0 };
            }

            avgStats[symbol].deliv += deliv;
            avgStats[symbol].trade += trade;
            avgStats[symbol].count += 1;
        });

        // Second Pass: Spike Identification
        dailyData?.forEach(item => {
            const sym = normalizeSymbol(item.SYMBOL);
            const deliv = Number(item.DELIV_QTY || 0);
            const trade = Number(item.TTL_TRD_QNTY || 0);
            const dateStr = item.DATE1 || '';
            const avg = avgStats[sym];
            if (!sym || !avg || avg.count < 5 || !filteredSymbols.has(sym)) return;

            const avgDeliv = avg.deliv / avg.count;
            const avgTrade = avg.trade / avg.count;

            const delivPct = avgDeliv > 0 ? ((deliv - avgDeliv) / avgDeliv) * 100 : 0;
            const tradePct = avgTrade > 0 ? ((trade - avgTrade) / avgTrade) * 100 : 0;

            if (delivPct > 70 && tradePct > 70) {
                const formattedDate = new Date(dateStr);
                const dateKey = `${formattedDate.getDate().toString().padStart(2, '0')}/${(formattedDate.getMonth() + 1).toString().padStart(2, '0')}/${formattedDate.getFullYear()}`;

                if (!results[sym]) results[sym] = {};
                results[sym][dateKey] = {
                    DELIV_QTY_avg: Math.round(avgDeliv),
                    DELIV_QTY_percent: delivPct.toFixed(2) + '%',
                    TTL_TRD_QNTY_avg: Math.round(avgTrade),
                    TTL_TRD_QNTY_percent: tradePct.toFixed(2) + '%'
                };

                symbolCount[sym] = (symbolCount[sym] || 0) + 1;
            }
        });

        const dateAverages = {};
        for (const sym in results) {
            if (symbolCount[sym] >= 2) {
                dateAverages[sym] = results[sym];
            }
        }

        const availableSymbols = new Set(Object.keys(dateAverages));
        const commonFilteredStocks = filteredStocks.filter(stock => availableSymbols.has(normalizeSymbol(stock.stockName)));
        // const commonFilteredStocks = filteredStocks.filter(stock => availableSymbols.has(normalizeSymbol(stock.nseCode)));

        // === Score logic
        function getScore(stock, monthKeys) {
            const values = monthKeys.map(month => stock[month]);

            if (values.some(v => typeof v === 'number' && v < 0)) return 0;

            const allAbove5 = values.every(val => typeof val === 'number' && val > 4);
            if (allAbove5) return 3;

            let streak = 0;
            for (const val of values) {
                if (typeof val === 'number' && val > 4) {
                    streak++;
                    if (streak >= 2) return 2;
                } else {
                    streak = 0;
                }
            }

            return 1;
        }

        const finalStocks = commonFilteredStocks
            .filter(stock => allMonthKeys.some(month => typeof stock[month] === 'number'))
            .sort((a, b) => getScore(b, allMonthKeys) - getScore(a, allMonthKeys));

        // Optional Query Param Filter
        // const filterByCode = req.query.nseCode?.toUpperCase();
        // let finalStocks = commonFilteredStocks;
        // if (filterByCode) {
        //     finalStocks = finalStocks.filter(stock => normalizeSymbol(stock.nseCode) === filterByCode);
        // }

        const result = {
            status: 200,
            success: true,
            monthsHeader: Array.from(monthsHeaderSet),
            stocks: finalStocks,
            dateAverages
        };

        cache.set('combineCaps_Daily', result);        
        return result

    } catch (err) {
        return { status: 500, success: false, message: err.message };
    }
};

exports.getFundData = async (req, res) => {
    const { type, to_date } = req.query;

    let data = [];
    try {
        switch (type) {
            case 'daily-spurts':
                if (!to_date) {
                    return res.status(400).json({ message: 'to_date is required for daily-spurts' });
                }
                data = await getDeliveryStats_DailySpurtsData(to_date);
                break;
            case 'large-cap':
                data = await getDeliveryStats_AllCap('largecap');
                break;
            case 'mid-cap':
                data = await getDeliveryStats_AllCap('midcap');
                break;
            case 'small-cap':
                data = await getDeliveryStats_AllCap('smallcap');
                break;
            case 'combine-cap':
                // data = await getCombineDeliveryStats_AllCap();
                data = await getCombineDeliveryStats_AllCapAndDaily();
                break;
            default:
                return res.status(400).json({ message: 'Invalid or missing fund type' });
        }

        res.status(200).json({ success: true, data });

    } catch (err) {
        console.error('Error in getFundData:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};
