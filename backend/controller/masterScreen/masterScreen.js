// const fs = require('fs');
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const readerFileService = require('../../services/fileReadingServices');

exports.masterScreenController_first = async (req, res) => {
    try {
        const caps = ['LARGECAP', 'MIDCAP', 'SMALLCAP'];
        const stockMaps = [];
        const monthsHeaderSet = new Set();

        function cleanKeyDynamic(key) {
            return key
                .replace(/<[^>]*>/g, '')
                .replace(/%/g, 'Percent')
                .replace(/[^a-zA-Z0-9 ]/g, '')
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

        // === Read and process all cap data ===
        for (const cap of caps) {
            const data = await readerFileService.mergeCSVFile(cap);
            const stockMap = new Map();

            data?.data?.forEach(item => {
                const modifiedKey = cleanKeys(item);
                if (!modifiedKey || typeof modifiedKey !== 'object') return;

                Object.keys(modifiedKey).forEach(key => {
                    const match = key.match(/^valueAsOf(\d*)([A-Za-z]+)(\d{4})$/);
                    if (match) {
                        const month = match[2];
                        const year = match[3].slice(2);
                        const label = `${month}-${year}`;
                        monthsHeaderSet.add(label);
                    }
                });

                const keyName = modifiedKey.nseCode?.trim();
                if (keyName) {
                    const stockKey = keyName.toLowerCase();
                    const existing = stockMap.get(stockKey) || { stockName: keyName };

                    Object.keys(modifiedKey).forEach(key => {
                        const match = key.match(/^valueAsOf(\d*)([A-Za-z]+)(\d{4})$/);
                        if (match) {
                            const month = match[2];
                            const year = match[3].slice(2);
                            const formattedMonth = `${month}${year}`;

                            const dynamicPercentKey = `monthChangeInSharesPercent${month}${year}`;
                            const percentStr = modifiedKey[dynamicPercentKey] ?? modifiedKey.monthChangeInSharesPercent ?? '';
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
                }
            });

            stockMaps.push(stockMap);
        }

        // === Combine all stock keys from all caps ===
        const allStockKeysSet = new Set();
        stockMaps.forEach(map => {
            for (const key of map.keys()) {
                allStockKeysSet.add(key);
            }
        });

        const allMonthKeys = Array.from(monthsHeaderSet).map(m => m.replace('-', ''));

        // === Merge and filter final stocks ===
        const filteredStocks = [];

        for (const stockKey of allStockKeysSet) {
            const baseStock = stockMaps.find(map => map.has(stockKey))?.get(stockKey);
            if (!baseStock) continue;

            const mergedStock = { stockName: baseStock.stockName };
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

                mergedStock[month] = totalWeight !== 0 ? totalWeight : '-';
                grandTotal += totalWeight;
            }

            if (grandTotal !== 0) {
                filteredStocks.push(mergedStock);
            }
        }

        // === Optional Query Filter ===
        const queryCode = req.query.nseCode?.trim()?.toLowerCase();
        const result = queryCode
            ? filteredStocks.filter(stock => stock.stockName?.toLowerCase() === queryCode)
            : filteredStocks;

        return res.status(200).json(result);

    } catch (err) {
        console.error('Error in masterScreenController:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
};


exports.masterScreenController_second = async (req, res) => {
    try {
        const caps = ['LARGECAP', 'MIDCAP', 'SMALLCAP'];
        const stockMaps = [];
        const monthsHeaderSet = new Set();

        for (const cap of caps) {
            const response = await readerFileService.getMasterMergeCSVFileBasedUponCaps(cap);

            if (!response || !response.success) continue;

            const { newModifiedKeyRecord, modifiedKeyRecord, monthsHeader } = response;

            monthsHeader.forEach(month => monthsHeaderSet.add(month));

            const stockMap = new Map();
            newModifiedKeyRecord.forEach(stock => {
                const key = stock.stockName?.trim()?.toLowerCase();
                if (key) {
                    stockMap.set(key, stock);
                }
            });

            stockMaps.push(stockMap);
        }

        const allStockKeysSet = new Set();
        stockMaps.forEach(map => {
            for (const key of map.keys()) {
                allStockKeysSet.add(key);
            }
        });

        const monthKeys = Array.from(monthsHeaderSet).map(m => m.replace('-', ''));

        const mergedStocks = [];

        for (const stockKey of allStockKeysSet) {
            const baseStock = stockMaps.find(map => map.has(stockKey))?.get(stockKey);
            if (!baseStock) continue;

            const mergedStock = { stockName: baseStock.stockName };

            for (const month of monthKeys) {
                let total = 0;
                let found = false;

                for (const map of stockMaps) {
                    const stock = map.get(stockKey);
                    const value = stock?.[month];
                    if (typeof value === 'number') {
                        total += value;
                        found = true;
                    }
                }

                mergedStock[month] = found ? total : '-';
            }

            mergedStocks.push(mergedStock);
        }

        // === Sorting Logic (no score or label added)
        function getScoreForSort(stock) {
            const values = monthKeys.map(m => stock[m]);

            if (values.some(v => typeof v === 'number' && v < 0)) return 0;

            const allAbove5 = values.every(v => typeof v === 'number' && v >= 5);
            if (allAbove5) return 3;

            let streak = 0;
            for (const val of values) {
                if (typeof val === 'number' && val >= 5) {
                    streak++;
                    if (streak >= 2) return 2;
                } else {
                    streak = 0;
                }
            }

            return 1;
        }

        const sorted = mergedStocks
            .filter(stock => monthKeys.some(m => typeof stock[m] === 'number'))
            .sort((a, b) => getScoreForSort(b) - getScoreForSort(a));

        return res.status(200).json(sorted);

    } catch (err) {
        console.error('Error in masterScreenController:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
};


exports.masterScreenController = async (req, res) => {
    try {
        const caps = ['LARGECAP', 'MIDCAP', 'SMALLCAP'];
        const stockMaps = [];
        const monthsHeaderSet = new Set();

        const dailyPath = path.join(__dirname, '../../uploads/csvfilefolder');

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

        for (const cap of caps) {
            const { success, modifiedKeyRecord, monthsHeader } = await readerFileService.getMasterMergeCSVFileBasedUponCaps(cap);
            if (!success) continue;

            monthsHeader.forEach(m => monthsHeaderSet.add(m));
            const stockMap = new Map();

            modifiedKeyRecord?.forEach(modifiedKey => {
                const keyName = modifiedKey.nseCode?.trim();
                if (!keyName) return;

                const stockKey = keyName.toLowerCase();
                const existing = stockMap.get(stockKey) || { stockName: keyName };

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
        const allStockKeysSet = new Set();
        stockMaps.forEach(map => {
            for (const key of map.keys()) {
                allStockKeysSet.add(key);
            }
        });
        const allStockKeys = Array.from(allStockKeysSet);

        const filteredStocks = [];

        for (const stockKey of allStockKeys) {
            const baseStock = stockMaps.find(map => map.has(stockKey))?.get(stockKey);
            if (!baseStock) continue;

            const mergedStock = { stockName: baseStock.stockName };
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

                mergedStock[month] = totalWeight ? totalWeight : null;
                if (totalWeight) grandTotal += totalWeight;
            }

            if (grandTotal) filteredStocks.push(mergedStock);
        }

        // === Normalize
        function normalizeSymbol(name) {
            return name?.replace(/\s+/g, '').toUpperCase();
        }

        // === Read CSVs
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

        // === Spurt Analysis
        const dailyData = await readCSVFolder(dailyPath);
        const filteredSymbols = new Set(filteredStocks.map(stock => normalizeSymbol(stock.stockName)));

        const avgStats = {}, results = {}, symbolCount = {};

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

            // if (delivPct > 70 && tradePct > 70) {
            if (delivPct && tradePct) {
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

        // === Attach spurt data to all stocks (even if null)
        const commonFilteredStocks = filteredStocks.map(stock => {
            const symbol = normalizeSymbol(stock.stockName);
            return {
                ...stock,
                spurt: dateAverages[symbol] || null
            };
        });

        // === Scoring logic
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

        return res.status(200).json({
            status: 200,
            success: true,
            monthsHeader: Array.from(monthsHeaderSet),
            stocks: finalStocks
        });

    } catch (err) {
        return res.status(500).json({ status: 500, success: false, message: err.message });
    }
};

