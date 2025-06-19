// const fs = require('fs');
// const csvParser = require('csv-parser');
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


exports.masterScreenController = async (req, res) => {
    try {
        const caps = ['LARGECAP', 'MIDCAP', 'SMALLCAP'];
        const stockMaps = [];
        const monthsHeaderSet = new Set();

        for (const cap of caps) {
            const response = await readerFileService.getMasterMergeCSVFileBasedUponCaps(cap);

            if (!response || !response.success) continue;

            const { newModifiedKeyRecord, monthsHeader } = response;

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


