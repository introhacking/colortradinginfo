const mongoose = require('mongoose');
const largeCapSchema = require("../../model/sentimentals/largeCap.model");
const readerFileService = require("../../services/fileReadingServices");
const fs = require('fs')


exports.insertLargeCapStocksInBulk = async (req, resp) => {
    try {
        const excelBuffer = req.file.path;
        const excelInfo = await readerFileService.EXCELReader(excelBuffer, 'largeCapStocks')
        const stocks = excelInfo
        if (stocks.length > 0) {
            const newModifiedWithIdStocksLists = await largeCapSchema.insertMany(stocks);
            resp.status(201).send(newModifiedWithIdStocksLists);
        } else {
            resp.status(400).send('No stocks to insert');
        }
        fs.unlink(excelBuffer, (err) => {
            if (err) {
                return resp.status(500).send(err);
            }
            console.log('File deleted successfully.');
        })
    } catch (err) {
        console.error('Error inserting stocks:', err.message);
        resp.status(500).send('Error inserting stocks', err.message);
    }
}

exports.getLargeCapStock = async (req, resp) => {
    try {
        const stocks = await largeCapSchema.find();
        resp.status(200).json(stocks);
    } catch (error) {
        console.error('Error fetching stocks:', error);
        resp.status(500).send('Error fetching stocks');
    }

}

exports.updatingLargeCapStockById = async (req, resp) => {
    // const id = req.params._id
    const { stockName, monthlyData } = req.body;
    // console.log(req.body)
    try {
        const updatedStock = await largeCapSchema.findOneAndUpdate(
            { stockName },
            { monthlyData },
            { new: true, upsert: true }
        );

        resp.status(200).json(updatedStock);

    } catch (err) {
        console.error('Error updating stock:', err);
        resp.status(500).json({ err: 'Internal server error' });
    }
}

exports.deleteLargeCapStockById = async (req, resp) => {
    const id = req.params._id
    try {
        const document = await largeCapSchema.findById(id);
        if (!document) {
            return resp.status(404).json({ err: 'Document not found' });
        }
        const deleteStatus = await largeCapSchema.deleteOne({ _id: id })
        console.log(deleteStatus)
        resp.status(200).json('Deleted successfully');
    } catch (err) {
        resp.status(500).json({ err: 'Internal server error' });
    }
}

exports.getMergeCSVFileBasedUponCaps_isWorkingValid = async (req, resp) => {
    const { cap } = req.query;
    const capKey = cap?.toUpperCase();

    if (!capKey) {
        return resp.status(400).json({ success: false, message: 'Missing or invalid "cap" query parameter' });
    }

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

        function getWeight(percentageStr) {
            if (typeof percentageStr === 'string' && percentageStr.trim().toLowerCase() === 'new') {
                return 'New';
            }

            const percent = parseFloat(percentageStr);
            if (isNaN(percent) || percent <= 0) return 0;

            if (percent > 80) return 4;
            if (percent > 60) return 3;
            if (percent > 40) return 2;
            if (percent > 20) return 1;

            return 0; // For 0 < percent <= 20
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


            // Object.keys(modifiedKey).forEach((key) => {
            //     const match = key.match(/^valueAsOf\d*([A-Za-z]+)(\d{4})$/);
            //     if (match) {
            //         const month = match[1];
            //         const year = match[2].slice(2);
            //         const label = `${month}-${year}`;
            //         monthsHeaderSet.add(label);
            //     }
            // });

            // const weight = getWeight(modifiedKey.monthChangeInSharesPercent);
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
                                existing[formattedMonth] = (typeof existingValue === 'number' ? existingValue : 0) + numericWeight;
                            }
                        }


                        // const numericWeight = typeof weight === 'number' ? weight : 0;
                        // existing[formattedMonth] = (existing[formattedMonth] || 0) + numericWeight;
                    }
                });

                stockMap.set(stockKey, existing);
            }

            // if (keyName) {
            //     const stockKey = keyName.toLowerCase();
            //     if (!stockMap.has(stockKey)) {
            //         stockMap.set(stockKey, {
            //             stockName: keyName,
            //             monthlyData: 0,
            //         });
            //     }

            //     const existing = stockMap.get(stockKey);
            //     const numericWeight = typeof weight === 'number' ? weight : 0;
            //     existing.monthlyData += numericWeight;
            //     stockMap.set(stockKey, existing);
            // }
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
        // console.log(response)
        return resp.json({ success: true, response });

    } catch (err) {
        console.error(err);
        return resp.status(500).json({ success: false, message: 'Server error while processing data.' });
    }
};

exports.getMergeCSVFileBasedUponCaps = async (req, resp) => {
    const { cap } = req.query;
    const capKey = cap?.toUpperCase();

    if (!capKey) {
        return resp.status(400).json({ success: false, message: 'Missing or invalid "cap" query parameter' });
    }

    try {
        const data = await readerFileService.getMasterMergeCSVFileBasedUponCaps(capKey);
        return resp.json({ response: data })

    } catch (err) {
        console.log(err)
    }
}







// =-------------------------------------------------------------------------------------------------------------------------------- //
// ============================================= DATABASE OPERATION EXCUTE HERE ============================================ //

//DELETE

exports.deleteOrTruncateTable = async (req, resp) => {

    try {
        const db = mongoose.connection;
        const collection = db.collection('largestockschemas'); // Ensure the collection name matches exactly
        // console.log(collection); // Logging to check if the collection is retrieved
        await collection.deleteMany({});
        resp.status(200).json('Table rows data successfully delete');
    } catch (error) {
        console.error('Error truncating collection:', error);
    }

}