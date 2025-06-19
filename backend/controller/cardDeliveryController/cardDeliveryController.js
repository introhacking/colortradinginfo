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




// function readCSVFile(filePath) {
//     return new Promise((resolve, reject) => {
//         const result = [];
//         fs.createReadStream(filePath)
//             .pipe(csvParser({
//                 mapHeaders: ({ header }) => header.trim().toUpperCase().replace(/\s+/g, '_')
//             }))
//             .on('data', data => result.push(data))
//             .on('end', () => resolve(result))
//             .on('error', err => reject(err));
//     });
// }

// async function getDeliveryStats_DailySpurtsData() {
//     const folderPath = path.join(__dirname, '../../uploads/csvfilefolder');
//     const allFiles = await fsp.readdir(folderPath);
//     const csvFiles = allFiles.filter(file => file.match(/^date_\d{8}\.csv$/));

//     function extractDate(csvFile) {
//         const match = csvFile.match(/date_(\d{2})(\d{2})(\d{4})\.csv/);
//         if (match) {
//             const [_, dd, mm, yyyy] = match;
//             return new Date(`${yyyy}-${mm}-${dd}`);
//         }
//         return null;
//     }

//     function aggregateAverage(data) {
//         const sum = {};
//         const count = {};

//         data.forEach(row => {
//             const symbol = (row.SYMBOL || row.symbol || '').trim();

//             if (!row.SYMBOL || row.SERIES?.trim() !== 'EQ') return null; // Adding

//             const rawQty = (row.DELIV_QTY || row.deliv_qty || '').toString().replace(/,/g, '').trim();
//             const qty = parseFloat(rawQty);
//             if (!symbol || isNaN(qty)) return;

//             if (!sum[symbol]) {
//                 sum[symbol] = 0;
//                 count[symbol] = 0;
//             }
//             sum[symbol] += qty;
//             count[symbol] += 1;
//         });

//         const avg = {};
//         for (let symbol in sum) {
//             avg[symbol] = count[symbol] > 0 ? sum[symbol] / count[symbol] : 0;
//         }
//         return avg;
//     }

//     const fileList = csvFiles.map(file => ({
//         filename: file,
//         date: extractDate(file)
//     }))
//         .filter(f => f.date !== null)
//         .sort((a, b) => b.date - a.date);

//     if (fileList.length < 2) {
//         throw new Error('Not enough files to compare.');
//     }

//     const todayFile = fileList[0];
//     const previousFiles = fileList.slice(1, 6);

//     const todayData = await readCSVFile(path.join(folderPath, todayFile.filename));
//     const prevData = [];
//     for (const file of previousFiles) {
//         const content = await readCSVFile(path.join(folderPath, file.filename));
//         prevData.push(...content);
//     }

//     const avgQtyMap = aggregateAverage(prevData);
//     const higher = [];
//     const lower = [];

//     todayData.forEach(row => {
//         const symbol = (row.SYMBOL || '').trim();
//         const todayQty = parseFloat((row.DELIV_QTY || '0').replace(/,/g, '').trim()) || 0;
//         const avgQty = avgQtyMap[symbol] || 0;
//         if (avgQty === 0) return;

//         const percentChange = ((todayQty - avgQty) / avgQty) * 100;
//         // const status = percentChange > 0 ? 'higher' : 'lower';

//         const data = {
//             symbol,
//             current: todayQty,
//             average: avgQty.toFixed(2),
//             percentChanges: percentChange.toFixed(2) + '%',
//             // message: `${symbol}: ${Math.abs(percentChange).toFixed(2)}% ${status} than average`
//         };

//         if (!isNaN(percentChange)) {
//             if (percentChange > 400) {
//                 higher.push(data);
//             } else if (percentChange < 0) {
//                 lower.push(data);
//             }
//         }
//     });

//     const deduplicateBySymbol = (arr) => {
//         const seen = new Set();
//         return arr.filter(item => {
//             if (seen.has(item.symbol)) return false;
//             seen.add(item.symbol);
//             return true;
//         });
//     };

//     return {
//         status: true,
//         // fileCompared: todayFile.filename,
//         // whichFile: previousFiles,
//         higher: deduplicateBySymbol(higher),
//         // lower: deduplicateBySymbol(lower)
//     };
// }



const getDeliveryStats_DailySpurtsData_first = async (to_date) => {
    try {
        if (!to_date) {
            return {};
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

        for (const mainDate of mainDates) {
            const priorDates = allDates.filter(d => d < mainDate).slice(0, 5);
            const mainFile = fileDateMap.find(e => e.formatted === mainDate)?.file;
            const priorFiles = fileDateMap.filter(e => priorDates.includes(e.formatted));

            if (!mainFile || priorFiles.length < 5) continue;

            const rowsThisCycle = [];

            const mainContent = await fsp.readFile(path.join(folderPath, mainFile), 'utf8');
            const mainParsed = Papa.parse(mainContent.trim(), { header: true, skipEmptyLines: true });
            const mainDateISO = `${mainDate.slice(0, 4)}-${mainDate.slice(4, 6)}-${mainDate.slice(6)}`;

            const mainRows = mainParsed.data.map(row => {
                const cleaned = {};
                Object.keys(row).forEach(key => {
                    cleaned[key.trim()] = row[key];
                });

                if (!cleaned.SYMBOL || cleaned.SERIES?.trim() !== 'EQ') return null;
                cleaned.SOURCE_FILE = mainFile;
                cleaned.RECORD_DATE = mainDateISO;
                return cleaned;
            }).filter(Boolean);

            rowsThisCycle.push(...mainRows);

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

            const tempSymbolGroups = {};

            rowsThisCycle.forEach(row => {
                const symbol = row.SYMBOL?.trim();
                if (!symbol || row.SERIES?.trim() !== 'EQ') return;

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

            const filteredSymbolGroups = {};

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

                    if (percentChangeValue > 500 && percentChangeQtyTraded > 500) {
                        filteredSymbolGroups[symbol] = group;
                    }
                }
            }

            dateAverages[`${mainDateISO}`] = filteredSymbolGroups;
        }

        return {
            status: true,
            // overallAverage: finalSymbolGroups,
            // messages,
            // alerts,
            dateAverages,
            // includedFilesByDate,
            // mergedData: allRows
        };

    } catch (error) {
        console.error('Error in rolling comparison', error);
        return { status: 500, error: 'Server error' };
    }
};

const getDeliveryStats_DailySpurtsData_second = async (to_date) => {
    try {
        if (!to_date) return {};

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

        for (const mainDate of mainDates) {
            const priorDates = allDates.filter(d => d < mainDate).slice(0, 5);
            const mainFile = fileDateMap.find(e => e.formatted === mainDate)?.file;
            const priorFiles = fileDateMap.filter(e => priorDates.includes(e.formatted));

            if (!mainFile || priorFiles.length < 5) continue;

            const rowsThisCycle = [];

            const mainContent = await fsp.readFile(path.join(folderPath, mainFile), 'utf8');
            const mainParsed = Papa.parse(mainContent.trim(), { header: true, skipEmptyLines: true });
            const mainDateISO = `${mainDate.slice(0, 4)}-${mainDate.slice(4, 6)}-${mainDate.slice(6)}`;

            const mainRows = mainParsed.data.map(row => {
                const cleaned = {};
                Object.keys(row).forEach(key => cleaned[key.trim()] = row[key]);
                if (!cleaned.SYMBOL || cleaned.SERIES?.trim() !== 'EQ') return null;
                cleaned.SOURCE_FILE = mainFile;
                cleaned.RECORD_DATE = mainDateISO;
                return cleaned;
            }).filter(Boolean);

            rowsThisCycle.push(...mainRows);

            for (const { file, formatted } of priorFiles) {
                const content = await fsp.readFile(path.join(folderPath, file), 'utf8');
                const parsed = Papa.parse(content.trim(), { header: true, skipEmptyLines: true });
                const dateISO = `${formatted.slice(0, 4)}-${formatted.slice(4, 6)}-${formatted.slice(6)}`;
                const rows = parsed.data.map(row => {
                    const cleaned = {};
                    Object.keys(row).forEach(key => cleaned[key.trim()] = row[key]);
                    cleaned.SOURCE_FILE = file;
                    cleaned.RECORD_DATE = dateISO;
                    return cleaned;
                });
                rowsThisCycle.push(...rows);
            }

            const tempSymbolGroups = {};

            rowsThisCycle.forEach(row => {
                const symbol = row.SYMBOL?.trim();
                if (!symbol || row.SERIES?.trim() !== 'EQ') return;

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
                        TTL_TRD_QNTY: +(row.TTL_TRD_QNTY || 0),
                        DELIV_PER: row.DELIV_PER || '0%'
                    };
                } else {
                    tempSymbolGroups[symbol].DELIV_QTY_total += +(row.DELIV_QTY || 0);
                    tempSymbolGroups[symbol].TTL_TRD_QNTY_total += +(row.TTL_TRD_QNTY || 0);
                    tempSymbolGroups[symbol].count += 1;
                }
            });

            const filteredSymbolGroups = {};
            for (const symbol in tempSymbolGroups) {
                const group = tempSymbolGroups[symbol];
                const avgQty = group.count > 0 ? group.DELIV_QTY_total / group.count : 0;
                const avgQtyTraded = group.count > 0 ? group.TTL_TRD_QNTY_total / group.count : 0;
                group.DELIV_QTY_avg = avgQty.toFixed(2);
                group.TTL_TRD_QNTY_avg = avgQtyTraded.toFixed(2);

                if (group.to_date_row) {
                    const qty = group.to_date_row.DELIV_QTY;
                    const qtyTraded = group.to_date_row.TTL_TRD_QNTY;
                    // const delivPer = group.to_date_row.DELIV_PER;
                    const percentChangeValue = avgQty > 0 ? ((qty - avgQty) / avgQty) * 100 : 0;
                    const percentChangeQtyTraded = avgQtyTraded > 0 ? ((qtyTraded - avgQtyTraded) / avgQtyTraded) * 100 : 0;

                    group.DELIV_QTY_percentage = percentChangeValue.toFixed(2) + '%';
                    group.TTL_TRD_QNTY_percentage = percentChangeQtyTraded.toFixed(2) + '%';

                    if (percentChangeValue > 500 && percentChangeQtyTraded > 500) {
                        filteredSymbolGroups[symbol] = group;
                        const dynamicKey = `date_${mainDateISO.replace(/-/g, '_')}`;
                        // group[dynamicKey] = delivPer;
                        group[dynamicKey] = qty;
                    }
                }
            }

            dateAverages[`${mainDateISO}`] = filteredSymbolGroups;
        }

        // 🔍 Filter symbols that appear in more than one date
        const symbolAppearanceMap = {};

        for (const date in dateAverages) {
            for (const symbol in dateAverages[date]) {
                symbolAppearanceMap[symbol] = (symbolAppearanceMap[symbol] || 0) + 1;
            }
        }

        for (const date in dateAverages) {
            for (const symbol of Object.keys(dateAverages[date])) {
                if (symbolAppearanceMap[symbol] <= 1) {
                    delete dateAverages[date][symbol];
                }
            }
        }
        // console.log(dateAverages)
        return { status: true, dateAverages };
    } catch (error) {
        console.error('Error in rolling comparison', error);
        return { status: 500, error: 'Server error' };
    }
};

const getDeliveryStats_DailySpurtsData_third = async (to_date) => {
    try {
        if (!to_date) return {};

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

        for (const mainDate of mainDates) {
            const priorDates = allDates.filter(d => d < mainDate).slice(0, 5);
            const mainFile = fileDateMap.find(e => e.formatted === mainDate)?.file;
            const priorFiles = fileDateMap.filter(e => priorDates.includes(e.formatted));

            if (!mainFile || priorFiles.length < 5) continue;

            const rowsThisCycle = [];

            const mainContent = await fsp.readFile(path.join(folderPath, mainFile), 'utf8');
            const mainParsed = Papa.parse(mainContent.trim(), { header: true, skipEmptyLines: true });
            const mainDateISO = `${mainDate.slice(0, 4)}-${mainDate.slice(4, 6)}-${mainDate.slice(6)}`;

            const mainRows = mainParsed.data.map(row => {
                const cleaned = {};
                Object.keys(row).forEach(key => cleaned[key.trim()] = row[key]);
                if (!cleaned.SYMBOL || cleaned.SERIES?.trim() !== 'EQ') return null;
                cleaned.SOURCE_FILE = mainFile;
                cleaned.RECORD_DATE = mainDateISO;
                return cleaned;
            }).filter(Boolean);

            rowsThisCycle.push(...mainRows);

            for (const { file, formatted } of priorFiles) {
                const content = await fsp.readFile(path.join(folderPath, file), 'utf8');
                const parsed = Papa.parse(content.trim(), { header: true, skipEmptyLines: true });
                const dateISO = `${formatted.slice(0, 4)}-${formatted.slice(4, 6)}-${formatted.slice(6)}`;
                const rows = parsed.data.map(row => {
                    const cleaned = {};
                    Object.keys(row).forEach(key => cleaned[key.trim()] = row[key]);
                    cleaned.SOURCE_FILE = file;
                    cleaned.RECORD_DATE = dateISO;
                    return cleaned;
                });
                rowsThisCycle.push(...rows);
            }

            const tempSymbolGroups = {};

            rowsThisCycle.forEach(row => {
                const symbol = row.SYMBOL?.trim();
                if (!symbol || row.SERIES?.trim() !== 'EQ') return;

                if (!tempSymbolGroups[symbol]) {
                    tempSymbolGroups[symbol] = {
                        DELIV_QTY_total: 0,
                        TTL_TRD_QNTY_total: 0,
                        count: 0,
                        to_date_row: null,
                        datewise: {} // NEW: holds delivery quantity by date
                    };
                }

                const recordDate = row.RECORD_DATE;
                const delivQty = +(row.DELIV_QTY || 0);
                const ttlQty = +(row.TTL_TRD_QNTY || 0);
                // const delivPer = row.DELIV_PER || '0%';

                // Store delivery quantity for the date
                tempSymbolGroups[symbol].datewise[recordDate] = delivQty;

                if (recordDate === mainDateISO) {
                    tempSymbolGroups[symbol].to_date_row = {
                        DELIV_QTY: delivQty,
                        TTL_TRD_QNTY: ttlQty,
                        // DELIV_PER: delivPer
                    };
                } else {
                    tempSymbolGroups[symbol].DELIV_QTY_total += delivQty;
                    tempSymbolGroups[symbol].TTL_TRD_QNTY_total += ttlQty;
                    tempSymbolGroups[symbol].count += 1;
                }
            });

            const filteredSymbolGroups = {};

            for (const symbol in tempSymbolGroups) {
                const group = tempSymbolGroups[symbol];
                const avgQty = group.count > 0 ? group.DELIV_QTY_total / group.count : 0;
                const avgQtyTraded = group.count > 0 ? group.TTL_TRD_QNTY_total / group.count : 0;
                group.DELIV_QTY_avg = avgQty.toFixed(2);
                group.TTL_TRD_QNTY_avg = avgQtyTraded.toFixed(2);

                if (group.to_date_row) {
                    const qty = group.to_date_row.DELIV_QTY;
                    const qtyTraded = group.to_date_row.TTL_TRD_QNTY;
                    // const delivPer = group.to_date_row.DELIV_PER;

                    const percentChangeValue = avgQty > 0 ? ((qty - avgQty) / avgQty) * 100 : 0;
                    const percentChangeQtyTraded = avgQtyTraded > 0 ? ((qtyTraded - avgQtyTraded) / avgQtyTraded) * 100 : 0;

                    group.DELIV_QTY_percentage = percentChangeValue.toFixed(2) + '%';
                    group.TTL_TRD_QNTY_percentage = percentChangeQtyTraded.toFixed(2) + '%';

                    if (percentChangeValue > 400 && percentChangeQtyTraded > 400) {
                        // Final output per symbol
                        filteredSymbolGroups[symbol] = group;

                        // Add date-wise DELIV_QTY to group
                        Object.entries(group.datewise || {}).forEach(([date, qty]) => {
                            const dynamicKey = `date_${date.replace(/-/g, '_')}`;
                            group[dynamicKey] = qty;
                        });

                        // Clean up
                        delete group.datewise;
                    }
                }
            }

            dateAverages[`${mainDateISO}`] = filteredSymbolGroups;
        }

        // Filter symbols that appear in more than one date
        const symbolAppearanceMap = {};
        for (const date in dateAverages) {
            console.log(dateAverages[date])
            for (const symbol in dateAverages[date]) {
                symbolAppearanceMap[symbol] = (symbolAppearanceMap[symbol] || 0) + 1;
            }
        }

        for (const date in dateAverages) {
            for (const symbol of Object.keys(dateAverages[date])) {
                if (symbolAppearanceMap[symbol] <= 1) {
                    delete dateAverages[date][symbol];
                }
            }
        }


        // const MIN_OCCURRENCE = 2; // Or 5 if you want exactly 5-day symbols

        // const symbolAppearanceMap = {};
        // for (const date in dateAverages) {
        //     for (const symbol in dateAverages[date]) {
        //         symbolAppearanceMap[symbol] = (symbolAppearanceMap[symbol] || 0) + 1;
        //     }
        // }

        // for (const date in dateAverages) {
        //     for (const symbol of Object.keys(dateAverages[date])) {
        //         if (symbolAppearanceMap[symbol] < MIN_OCCURRENCE) {
        //             delete dateAverages[date][symbol];
        //         }
        //     }
        // }


        return { status: true, dateAverages };

    } catch (error) {
        console.error('Error in rolling comparison', error);
        return { status: 500, error: 'Server error' };
    }
};

const getDeliveryStats_DailySpurtsData_fourth = async (to_date) => {
    try {
        if (!to_date) return {};

        const folderPath = path.join(__dirname, '../../uploads/csvfilefolder');

        const formatDate = (dateString) => {
            const [year, month, day] = dateString.split('-');
            return `${year}${month}${day}`;
        };

        // const formatDate = (dateStr) => dateStr.split('-').join('');

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
        const mainDates = allDates.slice(toIndex, toIndex + 5);

        const results = {};
        const symbolCount = {};

        for (const mainDate of mainDates) {
            const prevDates = allDates.filter(d => d < mainDate).slice(0, 5);
            if (prevDates.length < 5) continue;

            const mainFile = dateFiles.find(f => f.formatted === mainDate)?.file;
            if (!mainFile) continue;
            const mainCSV = await fsp.readFile(path.join(folderPath, mainFile), 'utf8');
            const mainParsed = Papa.parse(mainCSV, { header: true, skipEmptyLines: true }).data;
            const mainData = mainParsed.filter(r => r.SERIES?.trim() !== 'EQ');



            const avgStats = {};

            for (const prevDate of prevDates) {
                const prevFile = dateFiles.find(f => f.formatted === prevDate)?.file;
                if (!prevFile) continue;

                const content = await fsp.readFile(path.join(folderPath, prevFile), 'utf8');
                const parsed = Papa.parse(content, { header: true, skipEmptyLines: true }).data.filter(r => r.SERIES?.trim().toUpperCase() !== 'EQ');

                for (const row of parsed) {
                    console.log(row)
                    const sym = row.SYMBOL?.trim();
                    if (!sym) continue;

                    if (!avgStats[sym]) avgStats[sym] = { deliv: 0, trade: 0, count: 0 };
                    avgStats[sym].deliv += Number(row.DELIV_QTY || 0);
                    avgStats[sym].trade += Number(row.TTL_TRD_QNTY || 0);
                    avgStats[sym].count += 1;
                }
            }
            console.log(`[${mainDate}] EQ rows in mainFile:`, mainData.length);
            console.log(`[${mainDate}] avgStats keys:`, Object.keys(avgStats).length);

            const mainSeriesSet = new Set(mainParsed.map(r => r.SERIES?.trim()));
            console.log(`[${mainDate}] All SERIES in mainFile:`, Array.from(mainSeriesSet));


            for (const row of mainData) {
                // console.log(row)
                const sym = row.SYMBOL?.trim();
                const deliv = Number(row.DELIV_QTY || 0);
                const trade = Number(row.TTL_TRD_QNTY || 0);
                const avg = avgStats[sym];

                if (!sym || !avg || avg.count < 5) continue;

                const avgDeliv = avg.deliv / avg.count;
                const avgTrade = avg.trade / avg.count;

                const delivPct = avgDeliv > 0 ? ((deliv - avgDeliv) / avgDeliv) * 100 : 0;
                const tradePct = avgTrade > 0 ? ((trade - avgTrade) / avgTrade) * 100 : 0;

                if (sym === 'RELIANCE') {
                    console.log(`${mainDate} RELIANCE: avgDeliv=${avgDeliv}, todayDeliv=${deliv}, delivPct=${delivPct}`);
                }

                if (delivPct > 50 && tradePct > 50) {
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

        // Filter symbols with 2 or more appearances
        const filteredResults = {};
        for (const sym in results) {
            if (symbolCount[sym] >= 2) {
                filteredResults[sym] = results[sym];

                console.log('Symbols and how many days matched >400%:', symbolCount);

            }
        }
        console.log(filteredResults)

        console.log('--- Summary ---');
        console.log('All Symbols Matched:', Object.keys(results));
        console.log('Symbol Match Count:', symbolCount);
        console.log('Filtered Result:', filteredResults);


        return {
            status: true,
            data: filteredResults
        };

    } catch (error) {
        console.error('Error in rolling comparison', error);
        return { status: 500, error: 'Server error' };
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



const getDeliveryStats_AllCap = async (cap) => {
    const capKey = cap?.toUpperCase();
    try {
        const data = await readerFileService.getMasterMergeCSVFileBasedUponCaps(capKey);

        const { monthsHeader, newModifiedKeyRecord } = data

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

        // Format month keys correctly: ['Apr25', 'May25', 'Mar25']
        const monthKeys = monthsHeader.map(m => m.replace('-', ''));

        // Apply filtering and sorting
        const filteredStocks = newModifiedKeyRecord
            .filter(stock => monthKeys.some(month => typeof stock[month] === 'number'))
            .sort((a, b) => getScore(b, monthKeys) - getScore(a, monthKeys));


        // const filteredStocks = newModifiedKeyRecord
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


const caps = ['largecap', 'midcap', 'smallcap'];

const getCombineDeliveryStats_AllCaps = async () => {
    try {
        const stockMaps = [];
        const monthsHeaderSet = new Set();

        // Utility functions (same as before)
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

        // Process each cap and build stockMap for each
        for (const cap of caps) {
            const capKey = cap.toUpperCase();
            const data = await readerFileService.mergeCSVFile(capKey);
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

            stockMaps.push(stockMap);
        }


        // Common months
        const monthsHeader = Array.from(monthsHeaderSet);
        const allMonthKeys = monthsHeader.map(m => m.replace('-', ''));

        // Get intersection of stock names
        const allStockNames = stockMaps.map(map => new Set([...map.keys()]));
        const commonStocks = [...allStockNames[0]].filter(name =>
            allStockNames.every(set => set.has(name))
        );



        // Filter stocks
        const filteredStocks = [];

        for (const stockKey of commonStocks) {
            const baseStock = stockMaps[0].get(stockKey);  // use name from first map
            const mergedStock = { stockName: baseStock.stockName };

            let isValid = true;

            for (const month of allMonthKeys) {
                let totalWeight = 0;

                for (const map of stockMaps) {
                    const stock = map.get(stockKey);
                    const weight = stock?.[month];

                    if (typeof weight !== 'number') {
                        mergedStock[month] = null;
                    } else {
                        totalWeight += weight;
                        if (!mergedStock[month]) mergedStock[month] = 0;
                        mergedStock[month] += weight;
                    }

                    // if (typeof weight !== 'number' && weight <= 6) {
                    //     isValid = false;
                    //     break;
                    // }

                    totalWeight += weight;
                }

                if (!isValid) break;

                mergedStock[month] = totalWeight;  // Or average if you prefer
            }

            if (isValid) {
                filteredStocks.push(mergedStock);
            }
        }

        return {
            status: 200,
            success: true,
            monthsHeader,
            stocks: filteredStocks
        };

    } catch (err) {
        return { status: 500, success: false, message: err.message };
    }
}

const getCombineDeliveryStats_AllCapss = async () => {
    try {
        const stockMaps = [];
        const monthsHeaderSet = new Set();

        // Utility functions
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
            if (typeof percentageStr === 'string' && percentageStr.trim().toLowerCase() === 'new') {
                return 'New';
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

        // Process each cap and build stockMap for each
        for (const cap of caps) {
            const capKey = cap.toUpperCase();
            const data = await readerFileService.mergeCSVFile(capKey);
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
                if (!keyName) return;

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

                        if (weight === 'New') {
                            existing[formattedMonth] = 'New';
                        } else {
                            existing[formattedMonth] = (typeof existingValue === 'number' ? existingValue : 0) + numericWeight;
                        }
                    }
                });

                stockMap.set(stockKey, existing);
            });

            stockMaps.push(stockMap);
        }

        // Return early if no stock maps were found
        if (stockMaps.length === 0) {
            return {
                status: 200,
                success: true,
                monthsHeader: [],
                stocks: []
            };
        }

        // Sort and prepare headers
        const monthsHeader = Array.from(monthsHeaderSet);
        const sortedMonthLabels = monthsHeader.sort(
            (a, b) => new Date(`01-${a}`) - new Date(`01-${b}`)
        );
        const allMonthKeys = sortedMonthLabels.map(m => m.replace('-', ''));

        // Get intersection of stock names
        const allStockNames = stockMaps.map(map => new Set([...map.keys()]));
        const commonStocks = [...allStockNames[0]].filter(name =>
            allStockNames.every(set => set.has(name))
        );

        // Filter and merge stocks
        const filteredStocks = [];

        for (const stockKey of commonStocks) {
            const baseStock = stockMaps[0].get(stockKey);
            const mergedStock = { stockName: baseStock.stockName };

            for (const month of allMonthKeys) {
                let totalWeight = 0;
                let validCount = 0;

                for (const map of stockMaps) {
                    const stock = map.get(stockKey);
                    const weight = stock?.[month];

                    // Only include strictly positive weights greater than 4
                    if (typeof weight === 'number' && weight > 5) {
                        totalWeight += weight;
                        validCount++;
                    }
                }

                // Only include months that had valid weights > 4
                mergedStock[month] = validCount > 0 ? totalWeight : null;
            }

            // Only include stocks that have at least one valid month
            const hasValidMonth = Object.values(mergedStock).some(
                (value, key) => key !== 'stockName' && typeof value === 'number' && value > 0
            );

            if (hasValidMonth) {
                filteredStocks.push(mergedStock);
            }
        }

        // for (const stockKey of commonStocks) {
        //     const baseStock = stockMaps[0].get(stockKey);
        //     const mergedStock = { stockName: baseStock.stockName };

        //     let isValid = true;

        //     for (const month of allMonthKeys) {
        //         let totalWeight = 0;
        //         let validCount = 0;

        //         for (const map of stockMaps) {
        //             const stock = map.get(stockKey);
        //             const weight = stock?.[month];

        //             if (typeof weight === 'number') {
        //                 totalWeight += weight;
        //                 validCount++;
        //             }
        //         }

        //         // If none of the maps had a valid number for this month, mark as null
        //         if (validCount === 0) {
        //             mergedStock[month] = null;
        //         } else {
        //             mergedStock[month] = totalWeight;
        //         }
        //     }

        //     if (isValid) {
        //         filteredStocks.push(mergedStock);
        //     }
        // }

        return {
            status: 200,
            success: true,
            monthsHeader: sortedMonthLabels,
            stocks: filteredStocks
        };

    } catch (err) {
        return { status: 500, success: false, message: err.message };
    }
};

const getCombineDeliveryStats_AllCap_third = async () => {
    try {
        // const caps = ['large', 'mid', 'small'];  // Define the 3 caps/folders
        const stockMaps = [];
        const monthsHeaderSet = new Set();

        // Utility to clean keys like "Value As Of Jan 2024"
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

        // Apply cleaning to every key in a record
        function cleanKeys(record) {
            const cleaned = {};
            for (const key in record) {
                const newKey = cleanKeyDynamic(key);
                cleaned[newKey || key] = record[key];
            }
            return cleaned;
        }

        // Convert percentage to weight scale
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

        // Process each cap (folder)
        for (const cap of caps) {
            const capKey = cap.toUpperCase();
            const data = await readerFileService.mergeCSVFile(capKey);  // Reads all files in the folder
            const stockMap = new Map();

            data.data?.forEach((item) => {
                const modifiedKey = cleanKeys(item);

                // Extract month-year labels from keys
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

            stockMaps.push(stockMap);
        }

        // Prepare headers
        const monthsHeader = Array.from(monthsHeaderSet);
        const allMonthKeys = monthsHeader.map(m => m.replace('-', ''));

        // Get common stocks across all caps
        const allStockNames = stockMaps.map(map => new Set([...map.keys()]));
        const commonStocks = [...allStockNames[0]].filter(name =>
            allStockNames.every(set => set.has(name))
        );

        // Filter and merge
        const filteredStocks = [];

        for (const stockKey of commonStocks) {
            const baseStock = stockMaps[0].get(stockKey);  // use name from first map
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

                if (totalWeight > 5) {
                    mergedStock[month] = totalWeight;
                    grandTotal += totalWeight;
                } else {
                    mergedStock[month] = null;
                }
            }

            if (grandTotal > 5) {
                filteredStocks.push(mergedStock);
            }
        }

        const avgStats = {};
        const results = {};
        const symbolCount = {};


        for (const row of filteredStocks) {
            console.log(row)
            const sym = row.stockName?.trim();
            const deliv = Number(row.DELIV_QTY || 0);
            const trade = Number(row.TTL_TRD_QNTY || 0);
            const avg = avgStats[sym];

            if (!sym || !avg || avg.count < 5) continue;

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

        // Filter for symbols that appeared 2+ times
        const dateAverages = {};
        for (const sym in results) {
            if (symbolCount[sym] >= 2) {
                dateAverages[sym] = results[sym];
            }
        }

        return {
            status: 200,
            success: true,
            monthsHeader,
            stocks: filteredStocks,
            dateAverages
        };

    } catch (err) {
        return { status: 500, success: false, message: err.message };
    }
};

const getCombineDeliveryStats_AllCapAndDaily_fourth = async () => {
    try {
        const caps = ['LARGECAP', 'MIDCAP', 'SMALLCAP'];
        const stockMaps = [];
        const monthsHeaderSet = new Set();

        const capBasePath = path.join(__dirname, '../../uploads/scrubbing');
        const dailyPath = path.join(__dirname, '../../uploads/csvfilefolder');

        // === Clean Keys ===
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

        // === Read cap data ===
        for (const cap of caps) {
            // const folderPath = path.join(capBasePath, cap);
            // console.log(folderPath)
            const data = await readerFileService.mergeCSVFile(cap);
            const stockMap = new Map();

            data.data?.forEach(item => {
                const modifiedKey = cleanKeys(item);

                Object.keys(modifiedKey).forEach(key => {
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

                    Object.keys(modifiedKey).forEach(key => {
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

            stockMaps.push(stockMap);
        }

        const allMonthKeys = Array.from(monthsHeaderSet).map(m => m.replace('-', ''));

        // === Find common stocks across all cap maps ===
        const allStockNames = stockMaps.map(map => new Set([...map.keys()]));
        const commonStocks = [...allStockNames[0]].filter(name =>
            allStockNames.every(set => set.has(name))
        );

        // === Merge cap data with weight filtering > 5 ===
        const filteredStocks = [];

        for (const stockKey of commonStocks) {
            const baseStock = stockMaps[0].get(stockKey);
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

                if (totalWeight > 5) {
                    mergedStock[month] = totalWeight;
                    grandTotal += totalWeight;
                } else {
                    mergedStock[month] = null;
                }
            }

            if (grandTotal > 5) {
                filteredStocks.push(mergedStock);
            }
        }

        // === Read Daily-Spurt Data ===
        // const dailyData = await readerFileService.mergeCSVFile(dailyPath);
        async function readCSVFile(filePath) {
            return new Promise((resolve, reject) => {
                const result = [];
                fs.createReadStream(filePath)
                    .pipe(csvParser({
                        mapHeaders: ({ header }) =>
                            header.trim().toUpperCase().replace(/\s+/g, '_')
                    }))
                    .on('data', data => result.push(data))
                    .on('end', () => resolve(result))
                    .on('error', err => reject(err));
            });
        }

        async function readCSVFolder(folderPath) {
            const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.csv'));
            let allData = [];

            for (const file of files) {
                const filePath = path.join(folderPath, file);
                const fileData = await readCSVFile(filePath);
                allData = allData.concat(fileData);
            }

            return allData;
        }
        const dailyData = await readCSVFolder(dailyPath);
        const avgStats = {};
        const results = {};
        const symbolCount = {};

        dailyData?.forEach(item => {
            const symbol = item.SYMBOL?.trim();
            if (!symbol) return;

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
            const sym = item.SYMBOL?.trim();
            const deliv = Number(item.DELIV_QTY || 0);
            const trade = Number(item.TTL_TRD_QNTY || 0);
            const dateStr = item.DATE || '';
            const avg = avgStats[sym];

            if (!sym || !avg || avg.count < 5) return;

            const avgDeliv = avg.deliv / avg.count;
            const avgTrade = avg.trade / avg.count;

            const delivPct = avgDeliv > 0 ? ((deliv - avgDeliv) / avgDeliv) * 100 : 0;
            const tradePct = avgTrade > 0 ? ((trade - avgTrade) / avgTrade) * 100 : 0;

            if (delivPct > 300 && tradePct > 300) {
                const formattedDate = new Date(dateStr);
                const dateKey = `${formattedDate.getDate().toString().padStart(2, '0')}/${(formattedDate.getMonth() + 1).toString().padStart(2, '0')
                    }/${formattedDate.getFullYear()}`;

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

        // === Final Filtering ===
        const dateAverages = {};
        for (const sym in results) {
            if (symbolCount[sym] >= 2) {
                dateAverages[sym] = results[sym];
            }
        }

        return {
            status: 200,
            success: true,
            monthsHeader: Array.from(monthsHeaderSet),
            stocks: filteredStocks,
            dateAverages
        };

    } catch (err) {
        return { status: 500, success: false, message: err.message };
    }
};

const getCombineDeliveryStats_AllCapAndDaily = async () => {
    try {
        const caps = ['LARGECAP', 'MIDCAP', 'SMALLCAP'];
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

        return {
            status: 200,
            success: true,
            monthsHeader: Array.from(monthsHeaderSet),
            stocks: finalStocks,
            dateAverages
        };
    } catch (err) {
        return { status: 500, success: false, message: err.message };
    }
};


const getCombineDeliveryStats_AllCapAndDaily_hold = async () => {
    try {
        const caps = ['LARGECAP', 'MIDCAP', 'SMALLCAP'];
        const stockMaps = [];
        const monthsHeaderSet = new Set();

        const capBasePath = path.join(__dirname, '../../uploads/scrubbing');
        const dailyPath = path.join(__dirname, '../../uploads/csvfilefolder');

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

        // === Read cap data ===
        for (const cap of caps) {
            const data = await readerFileService.mergeCSVFile(cap);
            const stockMap = new Map();

            data.data?.forEach(item => {
                const modifiedKey = cleanKeys(item);
                // console.log(modifiedKey)

                Object.keys(modifiedKey).forEach(key => {
                    const match = key.match(/^valueAsOf(\d*)([A-Za-z]+)(\d{4})$/);
                    if (match) {
                        const month = match[2];
                        const year = match[3].slice(2);
                        const label = `${month}-${year}`;
                        monthsHeaderSet.add(label);
                    }
                });

                // const keyName = modifiedKey.investedIn?.trim();
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

                            // FIX: Use fake percent if missing
                            const percentStr = modifiedKey.monthChangeInSharesPercent || '';
                            const weight = getWeight(percentStr);
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

            stockMaps.push(stockMap);
        }

        const allMonthKeys = Array.from(monthsHeaderSet).map(m => m.replace('-', ''));

        // === Find common stocks across all cap maps ===
        const allStockNames = stockMaps.map(map => new Set([...map.keys()]));
        const commonStocks = [...allStockNames[0]].filter(name =>
            allStockNames.every(set => set.has(name))
        );

        // console.log(commonStocks)

        // === Merge cap data with weight filtering > 3 ===
        const filteredStocks = [];

        for (const stockKey of commonStocks) {
            const baseStock = stockMaps[0].get(stockKey);
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

                if (totalWeight >= 4) {
                    mergedStock[month] = totalWeight;
                    grandTotal += totalWeight;
                } else {
                    mergedStock[month] = null;
                }
            }

            if (grandTotal >= 4) {
                filteredStocks.push(mergedStock);
            }
        }

        // console.log('Filtered Stocks Count:', filteredStocks.length);

        // === Read Daily-Spurt Data ===
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
            // const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.csv'));
            // [ GET 10 DAYS FILES FROM LATEST]
            const files = fs.readdirSync(folderPath)
                .filter(file => file.endsWith('.csv'))
                .map(file => ({
                    name: file,
                    time: fs.statSync(path.join(folderPath, file)).mtime.getTime()
                }))
                .sort((a, b) => b.time - a.time) // newest first
                .slice(0, 30) // pick top 30
                .map(file => file.name); // extract names

            let allData = [];

            for (const file of files) {
                const filePath = path.join(folderPath, file);
                const fileData = await readCSVFile(filePath);
                allData = allData.concat(fileData);
            }
            return allData;
        }

        const dailyData = await readCSVFolder(dailyPath);

        function normalizeSymbol(name) {
            return name?.replace(/\s+/g, '').toUpperCase();
        }

        // const filteredSymbols = new Set(filteredStocks.map(stock => stock.stockName.toUpperCase()));
        const filteredSymbols = new Set(filteredStocks.map(stock => normalizeSymbol(stock.stockName)));
        const avgStats = {};
        const results = {};
        const symbolCount = {};

        dailyData?.forEach(item => {
            // const symbol = item.SYMBOL?.trim()?.toUpperCase();
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
            // const sym = item.SYMBOL?.trim()?.toUpperCase();
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


            // if (!avg || avg.count < 5) {
            //     console.log(`❌ Skipping ${sym} - avg.count too low: ${avg?.count}`);
            // } else {
            //     const avgDeliv = avg.deliv / avg.count;
            //     const avgTrade = avg.trade / avg.count;

            //     const delivPct = avgDeliv > 0 ? ((deliv - avgDeliv) / avgDeliv) * 100 : 0;
            //     const tradePct = avgTrade > 0 ? ((trade - avgTrade) / avgTrade) * 100 : 0;

            //     console.log(`📊 ${sym} - delivPct: ${delivPct}, tradePct: ${tradePct}`);
            // }


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

        // Normalize function (already exists)
        function normalizeSymbol(name) {
            return name?.replace(/\s+/g, '').toUpperCase();
        }

        // Get normalized keys of dateAverages
        const availableSymbols = new Set(Object.keys(dateAverages));

        // Filter only those stocks whose normalized stockName exists in dateAverages
        const commonFilteredStocks = filteredStocks.filter(stock => {
            const normalizedStock = normalizeSymbol(stock.stockName);
            return availableSymbols.has(normalizedStock);
        });

        // console.log('Date Averages Symbol Count:', Object.keys(dateAverages).length);

        return {
            status: 200,
            success: true,
            monthsHeader: Array.from(monthsHeaderSet),
            // stocks: filteredStocks,
            stocks: commonFilteredStocks,
            dateAverages
        };

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
