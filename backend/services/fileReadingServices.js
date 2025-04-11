const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const FileReader = require('filereader')
const csv = require('csv-parser');
const fastCSV = require('fast-csv');
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
                } else {
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


    fetchDataFromCSV: async (url) => {
        if (!url) return console.error("❌ URL is required!");

        // Extract date from URL (if you need it)
        const dateMatch = url.match(/(\d{8})\.csv/);
        // console.log(dateMatch)
        // const dateMatch = url.match(/(\d{8})/);

        if (dateMatch) {
            try {
                // 1. Create Directory
                const folderPath = path.join(__dirname, '../uploads/csvfilefolder');
                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath, { recursive: true });
                }

                // 2. Fetch CSV content
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch CSV. Status: ${response.status}`);
                }

                const csvData = await response.text();

                // 3. Save CSV to file
                const fileName = `data_${dateMatch[0]}`;
                const filePath = path.join(folderPath, fileName);

                fs.writeFileSync(filePath, csvData);
                // console.log(`✅ CSV saved at: ${filePath}`);

                // 🟢 Return a Promise with parsed data

                // return new Promise((resolve, reject) => {
                //     const results = [];
                //     let headers = [];

                //     fs.createReadStream(filePath)
                //         .pipe(csv())
                //         .on('headers', (headerList) => {
                //             headers = headerList;
                //         })
                //         .on('data', (row) => {
                //             results.push(row);
                //         })
                //         .on('end', () => {
                //             resolve(results);
                //         })
                //         .on('error', (err) => {
                //             reject(err);
                //         });
                // });


                
                // 4. Read and parse CSV
                // fs.createReadStream(filePath)
                //     .pipe(csv())
                //     .on('data', (row) => {
                //         console.log('🟢 Row:', row); // Parsed row
                //     })
                //     .on('end', () => {
                //         console.log('✅ CSV parsing complete!');
                //     });

            } catch (error) {
                console.error('❌ Error fetching or processing CSV:', error.message);
            }
        } else {
            console.error("❌ CSV filename doesn't match expected pattern.");
        }

    }




    // sectorialImportImgTable: async (files) => {
    //     const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/tiff'];
    //     // Dynamically import the file-type module
    //     const converBase64 = (file) => {
    //         return new Promise((resolve, reject) => {
    //             const buffer = file.buffer || fs.readFileSync(file.path);
    //             const base64 = buffer.toString('base64');
    //             resolve(`data:${file.mimetype};base64,${base64}`);
    //             buffer.onerror = (error) => {
    //                 reject(error)
    //             }
    //         })
    //     }
    //     const imageData = [];
    //     try {

    //         const { fileTypeFromBuffer } = await import('file-type');

    //         // Helper function to process file
    //         const processFile = async (file, key) => {
    //             if (file) {
    //                 // console.log('file: ' , file)
    //                 let image_name = file.originalname;
    //                 const base64 = await converBase64(file)
    //                 //    console.log(base64)
    //                 //     if (file.buffer) {
    //                 //         buffer = file.buffer;
    //                 //     } else {
    //                 //         buffer = fs.readFileSync(file.path);
    //                 //     }
    //                 const buffer = file.buffer || fs.readFileSync(file.path);
    //                 const fileType = await fileTypeFromBuffer(buffer);
    //                 if (fileType && allowedImageTypes.includes(fileType.mime)) {
    //                     imageData.push({
    //                         key,
    //                         imgName: image_name,
    //                         bufferData: buffer,
    //                         contentType: fileType.mime,
    //                     });
    //                 } else {
    //                     console.log(`${key} file type not allowed or unknown: ${fileType ? fileType.mime : 'unknown'}`);
    //                 }
    //             } else {
    //                 console.log(`${key} file buffer is undefined`);
    //             }
    //         };

    //         // Process month file
    //         await processFile(files.month ? files.month[0] : null, 'month');

    //         // Process week file
    //         await processFile(files.week ? files.week[0] : null, 'week');

    //         // Process day file
    //         await processFile(files.day ? files.day[0] : null, 'day');


    //         // if (files.month) {
    //         //     const monthFile = files.month[0];
    //         //     const monthFileType = await fileTypeFromBuffer(monthFile.buffer);
    //         //     if (allowedImageTypes.includes(monthFileType.mime)) {
    //         //         imageData.push({
    //         //             key: 'month',
    //         //             data: monthFile.buffer,
    //         //             contentType: monthFileType.mime,
    //         //         });
    //         //     }
    //         // }

    //         // if (files.week) {
    //         //     const weekFile = files.week[0];
    //         //     const weekFileType = await fileTypeFromBuffer(weekFile.buffer);
    //         //     if (allowedImageTypes.includes(weekFileType.mime)) {
    //         //         imageData.push({
    //         //             key: 'week',
    //         //             data: weekFile.buffer,
    //         //             contentType: weekFileType.mime,
    //         //         });
    //         //     }
    //         // }

    //         // if (files.day) {
    //         //     const dayFile = files.day[0];
    //         //     const dayFileType = await fileTypeFromBuffer(dayFile.buffer);
    //         //     if (allowedImageTypes.includes(dayFileType.mime)) {
    //         //         imageData.push({
    //         //             key: 'day',
    //         //             data: dayFile.buffer,
    //         //             contentType: dayFileType.mime,
    //         //         });
    //         //     }
    //         // }


    //     } catch (error) {
    //         console.error('Error uploading data', error);
    //         throw new Error('File processing error');

    //     }
    //     return imageData
    // }


}

module.exports = readerFileService;