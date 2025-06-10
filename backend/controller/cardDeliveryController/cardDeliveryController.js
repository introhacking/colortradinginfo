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

                    if (percentChangeValue > 500 && percentChangeQtyTraded > 500) {
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

        return { status: true, dateAverages };

    } catch (error) {
        console.error('Error in rolling comparison', error);
        return { status: 500, error: 'Server error' };
    }
};


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

const getCombineDeliveryStats_AllCap = async () => {
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

        return {
            status: 200,
            success: true,
            monthsHeader,
            stocks: filteredStocks
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
                data = await getCombineDeliveryStats_AllCap();
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
