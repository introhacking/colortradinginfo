const xlsx = require('xlsx');
const fs = require('fs');
const fsp = fs.promises; // Access promise-based fs methods
const path = require('path');
const FileReader = require('filereader')
const csv = require('csv-parser');
const fastCSV = require('fast-csv');
const Papa = require('papaparse');
const createTechicalBankingSchema = require('../model/technical/banking/technical.banking.model');
const createTechicalBankingSchemaOPG = require('../model/technical/banking/technical.banking.OPG.model');
const createTechicalBankingSchemaNPG = require('../model/technical/banking/technical.banking.NPG.model');

// GET DATA FROM URL
const fetch = require('node-fetch');
const { Readable } = require('stream');



const readerFileService = {

    //  EXCEL READER
    EXCELReader: async (excelBuffer, types) => {
        try {
            // Read data from the text file
            const rawData = fs.readFileSync(excelBuffer, 'utf8').split('\n').filter(Boolean);

            // Prepare data for the application
            stockData = rawData.map((row, index) => {

                if (types === 'delivery') {
                    const [stockName, ...volumnDeliveryData] = row.split(',');

                    const processedData = volumnDeliveryData.map(value => {
                        // Handle non-numeric values and empty strings
                        if (value === '-' || value.trim() === '') {
                            return 0; // or 0 or another placeholder
                        }
                        const number = Number(value);
                        return isNaN(number) ? 0 : number;
                    });
                    return {
                        stockName,
                        volumnDeliveryData: processedData // Convert strings to numbers
                    };
                }
                // if (types === 'largeCapStocks') {
                //     const [stockName, ...monthlyData] = row.split(',');
                //     return {
                //         stockName,
                //         monthlyData: monthlyData.map(Number) // Convert strings to numbers
                //     };
                // }

                else {
                    const [stockName, ...monthlyData] = row.split(',');
                    return {
                        stockName,
                        monthlyData: monthlyData.map(Number) // Convert strings to numbers
                    };
                }
            });
            // console.log(stockData)

            // Prepare data for Excel
            const data = stockData.map((name, index) => (name));

            // console.log(data)

            // Convert data to worksheet
            const worksheet = xlsx.utils.json_to_sheet(data);

            // Create a new workbook and add the worksheet
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, 'StockNames');

            // // Write the workbook to a file
            // xlsx.writeFile(workbook, 'smallCaps.xlsx');

            // console.log('Data has been written to smallCaps.xlsx');

            return data
        } catch (error) {

            throw error.message
        }


    },


    // Bank services
    bankExcelReader: async (bankExcelBuffer) => {

        try {
            const filePath = bankExcelBuffer;

            // Read Excel file
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(sheet);
            return data
            // res.status(201).json({ message: 'Data uploaded successfully' });
        } catch (error) {
            console.error('Error uploading data', error);
            // res.status(500).json({ error: 'Internal server error' });
        }
    },


    createDynamicTable: async (filePath) => {
        return new Promise((resolve, reject) => {
            const results = [];
            let headers = [];

            fs.createReadStream(filePath)
                .pipe(csv())
                .on('headers', (headerList) => {
                    headers = headerList;
                })
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    const DynamicModel = createTechicalBankingSchema(headers);
                    resolve({ results, DynamicModel });
                })
                .on('error', (error) => reject(error));
        });

    },
    createDynamicTableOPG: async (filePath) => {
        return new Promise((resolve, reject) => {
            const results = [];
            let headers = [];

            fs.createReadStream(filePath)
                .pipe(csv())
                .on('headers', (headerList) => {
                    headers = headerList;
                })
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    const DynamicModel = createTechicalBankingSchemaOPG(headers);
                    resolve({ results, DynamicModel });
                })
                .on('error', (error) => reject(error));
        });

    },
    createDynamicTableNPG: async (filePath) => {
        return new Promise((resolve, reject) => {
            const results = [];
            let headers = [];

            fs.createReadStream(filePath)
                .pipe(csv())
                .on('headers', (headerList) => {
                    headers = headerList;
                })
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    const DynamicModel = createTechicalBankingSchemaNPG(headers);
                    resolve({ results, DynamicModel });
                })
                .on('error', (error) => reject(error));
        });

    },



    // OPTIMIZE CODE 
    sectorialImportImgTable: async (files) => {
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/tiff'];

        // Function to convert a file buffer to a base64-encoded string
        const convertToBase64 = (buffer, mimeType) => {
            return `data:${mimeType};base64,${buffer.toString('base64')}`;
        };

        // console.log(files)

        const processFile = async (file, key) => {
            if (!file) {
                console.log(`${key} file buffer is undefined`);
                return null;
            }

            try {
                const { fileTypeFromBuffer } = await import('file-type');
                const buffer = file.buffer || fs.readFileSync(file.path);
                const fileType = await fileTypeFromBuffer(buffer);

                if (fileType && allowedImageTypes.includes(fileType.mime)) {
                    return {
                        key,
                        imgName: file.originalname,
                        bufferData: buffer,
                        contentType: fileType.mime,
                        base64: convertToBase64(buffer, fileType.mime), // Base64 encoded string
                    };
                } else {
                    console.log(`${key} file type not allowed or unknown: ${fileType ? fileType.mime : 'unknown'}`);
                    return null;
                }

            } catch (error) {
                console.error(`Error processing file ${key}:`, error);
                throw new Error('File processing error');
            }
        };

        try {
            const imageData = await Promise.all([
                processFile(files.month ? files.month[0] : null, 'month'),
                processFile(files.week ? files.week[0] : null, 'week'),
                processFile(files.day ? files.day[0] : null, 'day'),
            ]);

            // Filter out any null values (in case some files were not processed)
            return imageData.filter(item => item !== null);

        } catch (error) {
            console.error('Error uploading data:', error);
            throw new Error('File processing error');
        }
    },





    // FROM URL
    fetchCSVData: async (url) => {
        // Extract the date using regex
        const dateMatch = url.match(/(\d{8})\.csv/);
        if (dateMatch) {
            const rawDate = dateMatch[1]; // "15032025"
            // Convert to a readable format (DD-MM-YYYY)
            const formattedDate = `${rawDate.slice(0, 2)}-${rawDate.slice(2, 4)}-${rawDate.slice(4)}`;
            try {
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`Failed to fetch data. Status: ${response.status}`);
                }

                // const csvData = await response.headers;
                // console.log(csvData.raw().server)


                const csvData = await response.text();
                const results = await readerFileService.parseCSV(csvData);

                const modifiedData = {
                    date: formattedDate,
                    results,
                }

                return modifiedData

                // console.table(modifiedData);
            } catch (error) {
                console.error('Error fetching CSV data:', error.message);
            }
        }
    },

    parseCSV: (data) => {

        let extractedDate = "";

        // Extract date from the first row
        const dateMatch = data.match(/as on ([A-Za-z]+ \d{1,2},\d{4})/);
        // console.log(dateMatch[1])
        if (dateMatch) {
            // extractedDate = new Date(dateMatch[1]).toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
            extractedDate = dateMatch[1]
        }

        return new Promise((resolve, reject) => {
            const results = [];
            const stream = Readable.from(data)
            stream
                .pipe(csv())
                .on('data', (row) => {
                    results.push(row);
                })
                .on('end', () => {
                    resolve(results);
                })
                .on('error', (error) => {
                    reject(error);
                });
        });

    },



    fetchDataForDates: async (dates) => {
        if (!dates || dates.length === 0) {
            throw new Error('❌ No dates provided');
        }

        const fetchPromises = dates.map(date => readerFileService.downloadCSV(date));

        const results = await Promise.all(fetchPromises);

        const successData = results.filter(result => result.success);
        const failedDates = results.filter(result => !result.success);

        return {
            success: true,
            fetchedCount: successData.length,
            failedCount: failedDates.length,
            data: successData,
            errors: failedDates,
        };
    },

    downloadCSV: async (date) => {
        const url = `https://archives.nseindia.com/products/content/sec_bhavdata_full_${date}.csv`;
        const folderPath = path.join(__dirname, '../uploads/csvfilefolder');

        try {
            // Ensure folder exists
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }

            // Fetch CSV
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Oops! Data not found for ${date}. Status: ${response.status}`);
            }

            const csvData = await response.text();

            // Save CSV
            const fileName = `date_${date}.csv`;
            const filePath = path.join(folderPath, fileName);

            fs.writeFileSync(filePath, csvData);

            console.log(`✅ CSV saved for date: ${date}`);

            return { date, success: true };

        } catch (error) {
            console.error(`❌ Error fetching CSV for date ${date}:`, error.message);
            return { date, success: false, error: error.message };
        }
    },



    mergeCSVFile: async (capName) => {
        try {
            const folderPath = path.join(__dirname, `../uploads/scrubbing/${capName}`);
            const files = await fsp.readdir(folderPath); // Use promise version
            const csvFiles = files.filter(f => f.endsWith('.csv'));

            if (csvFiles.length === 0) {
                return { status: 404, success: false, message: 'No CSV files found' };
            }

            // Read all CSV files in parallel
            const readPromises = csvFiles.map(file =>
                fsp.readFile(path.join(folderPath, file), 'utf8') // Properly awaited
            );
            const fileContents = await Promise.all(readPromises);

            let allRows = [];
            fileContents.forEach((content) => {
                const parsed = Papa.parse(content.trim(), {
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
            return { status: 200, length: allRows.length, success: true, data: allRows };

        } catch (err) {
            // console.error(err);
            throw { status: 500, success: false, message: 'Error processing CSV files' };
        }
    },


    getMasterMergeCSVFileBasedUponCaps: async (cap) => {
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

            const modifiedKeyRecord = [];


            // function getWeight(percentageStr) {
            //     if (typeof percentageStr === 'string' && percentageStr.trim().toLowerCase() === 'new') {
            //         return 1;
            //     }

            //     const percent = parseFloat(percentageStr);
            //     if (isNaN(percent)) return 0;

            //     // Handle negative values
            //     if (percent < 0) {
            //         const absPercent = Math.abs(percent);
            //         if (absPercent > 100) return -6;
            //         if (absPercent > 80) return -5;
            //         if (absPercent > 60) return -4;
            //         if (absPercent > 40) return -3;
            //         if (absPercent > 20) return -2;
            //         return -1; // absPercent <= 20
            //     }

            //     // Positive ranges
            //     if (percent > 100) return 6;
            //     if (percent > 80) return 5;
            //     if (percent > 60) return 4;
            //     if (percent > 40) return 3;
            //     if (percent > 20) return 2;
            //     if (percent > 0) return 1;

            //     return 0; // 0 or invalid
            // }


            function getWeight(percentageStr) {
                if (typeof percentageStr === 'string' && percentageStr.trim().toLowerCase() === 'new') {
                    return 1;
                }

                const percent = parseFloat(percentageStr);

                // Handle invalid or missing value
                if (isNaN(percent)) return 0;

                // Negative values
                if (percent < 0) {
                    if (percent <= -40) return -3;
                    return -1;
                }

                // Positive ranges
                if (percent <= 20) return 1;
                if (percent <= 40) return 1;
                if (percent <= 60) return 1;
                if (percent <= 80) return 1;

                return 1; // > 80%, including > 100%
            }

            const monthsHeaderSet = new Set();
            const stockMap = new Map();

            data.data?.forEach((item, index) => {
                const modifiedKey = cleanKeys(item);
                modifiedKeyRecord.push(modifiedKey);

                // Extract month-year keys
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

                    // Go through all keys and find `valueAsOf...` keys
                    Object.keys(modifiedKey).forEach((key) => {
                        const match = key.match(/^valueAsOf(\d*)([A-Za-z]+)(\d{4})$/);
                        if (match) {
                            const month = match[2];
                            const year = match[3].slice(2);
                            const formattedMonth = `${month}${year}`;

                            const weight = getWeight(modifiedKey.monthChangeInSharesPercent);

                            if (weight === 'New') {
                                existing[formattedMonth] = 'New';
                            } else {
                                const numericWeight = typeof weight === 'number' ? weight : 0;
                                const existingValue = existing[formattedMonth];
                                if (existingValue === 'New') {
                                    existing[formattedMonth] = 'New';
                                } else {
                                    // existing[formattedMonth] = (typeof existingValue === 'number' ? existingValue : 0) + numericWeight;
                                    existing[formattedMonth] = (typeof existingValue === 'number' ? existingValue : 1);
                                }
                            }
                        }
                    });

                    stockMap.set(stockKey, existing);
                }

            });


            const allMonthKeys = Array.from(monthsHeaderSet).map(m => m.replace('-', ''));

            for (const stock of stockMap.values()) {
                for (const monthKey of allMonthKeys) {
                    if (!(monthKey in stock)) {
                        stock[monthKey] = '-';
                    }
                }
            }

            const newModifiedKeyRecord = Array.from(stockMap.values());

            const response = {
                modifiedKeyRecord,
                newModifiedKeyRecord,
                monthsHeader: Array.from(monthsHeaderSet),
            };
            return response;
        } catch (err) {
            // console.error(err);
            // return resp.status(500).json({ success: false, message: 'Server error while processing data.' });
            return err
        }
    }




    // [ WORKING ... ] ==========================================

    // fetchDataFromCSV: async (url) => {
    //     if (!url) return console.error("❌ URL is required!");

    //     // Extract date from URL (if you need it)
    //     const dateMatch = url.match(/(\d{8})\.csv/);

    //     if (dateMatch) {
    //         try {
    //             // 1. Create Directory
    //             const folderPath = path.join(__dirname, '../uploads/csvfilefolder');
    //             if (!fs.existsSync(folderPath)) {
    //                 fs.mkdirSync(folderPath, { recursive: true });
    //             }

    //             // 2. Fetch CSV content
    //             const response = await fetch(url);
    //             if (!response.ok) {
    //                 // throw new Error(`Failed to fetch CSV. Status: ${response.status}`);
    //                 throw new Error(`Oops! Data Not Found on date ${dateMatch[1]} with Status: ${response.status}`);
    //             }

    //             const csvData = await response.text();

    //             // 3. Save CSV to file
    //             const fileName = `data_${dateMatch[0]}`;
    //             const filePath = path.join(folderPath, fileName);

    //             fs.writeFileSync(filePath, csvData);

    //         } catch (error) {
    //             throw new Error(error.message);
    //         }
    //     } else {
    //         console.error("❌ CSV filename doesn't match expected pattern.");
    //     }

    // },


    // fetchDataForDates: async (dates) => {
    //     if (!dates || dates.length === 0) {
    //         throw new Error('No dates provided');
    //     }

    //     const fetchPromises = dates.map(date => {
    //         const url = `https://archives.nseindia.com/products/content/sec_bhavdata_full_${date}.csv`;
    //         return readerFileService.fetchDataFromCSV(url)
    //             .then(data => ({ date, data }))
    //             .catch(error => ({ date, error: error.message }));
    //     });

    //     const results = await Promise.all(fetchPromises);

    //     const successData = results.filter(result => !result.error);
    //     const failedDates = results.filter(result => result.error);

    //     return {
    //         success: true,
    //         fetchedCount: successData.length,
    //         failedCount: failedDates.length,
    //         data: successData,
    //         errors: failedDates,
    //     };
    // }

    // ==============================  END ===================  

}

module.exports = readerFileService;