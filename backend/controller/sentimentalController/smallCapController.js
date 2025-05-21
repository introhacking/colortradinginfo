const mongoose = require('mongoose');
const smallCapSchema = require("../../model/sentimentals/smallCap.model");
const readerFileService = require("../../services/fileReadingServices");
const fs = require('fs');


exports.insertSmallCapStocksInBulk = async (req, resp) => {
    try {
        const excelBuffer = req.file.path;
        const excelInfo = await readerFileService.EXCELReader(excelBuffer)
        const stocks = excelInfo
        if (stocks.length > 0) {
            const newModifiedWithIdStocksLists = await smallCapSchema.insertMany(stocks);
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


exports.getSmallCapStock = async (req, resp) => {
    try {
        const stocks = await smallCapSchema.find();
        resp.status(200).json(stocks);
    } catch (error) {
        console.error('Error fetching stocks:', error);
        resp.status(500).send('Error fetching stocks');
    }

}

exports.updatingSmallCapStockById = async (req, resp) => {
    // const id = req.params._id
    const { stockName, monthlyData } = req.body;
    // console.log(req.body)
    try {
        const updatedStock = await smallCapSchema.findOneAndUpdate(
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

exports.deleteSmallCapStockById = async (req, resp) => {
    const id = req.params._id
    try {
        const document = await smallCapSchema.findById(id);
        if (!document) {
            return resp.status(404).json({ err: 'Document not found' });
        }
        const deleteStatus = await smallCapSchema.deleteOne({ _id: id })
        resp.status(200).json('Deleted successfully');
    } catch (err) {
        resp.status(500).json({ err: 'Internal server error' });
    }
}

exports.getMergeCSVFileBasedUponCaps = async (req, resp) => {
    const { cap } = req.query;
    const capKey = cap?.toUpperCase();

    if (!capKey) {
        return resp.status(400).json({ success: false, message: 'Missing or invalid "cap" query parameter' });
    }

    try {
        const data = await readerFileService.getMasterMergeCSVFileBasedUponCaps(capKey);
        return resp.json({response: data })

    } catch (err) {

    }
}


// =-------------------------------------------------------------------------------------------------------------------------------- //
// ============================================= DATABASE OPERATION EXCUTE HERE ============================================ //
//  DELETE 

exports.deleteOrTruncateTable = async (req, resp) => {

    try {
        const db = mongoose.connection;
        const collection = db.collection('smallstockschemas'); // Ensure the collection name matches exactly
        // console.log(collection); // Logging to check if the collection is retrieved
        await collection.deleteMany({});
        resp.status(200).json('Table rows data successfully delete');
    } catch (error) {
        console.error('Error truncating collection:', error);
    }

}



// --------------------------------------------------------------------------------------------------------------------------------//
// =============================================== [ REQUEST FILES BASED UPON SMALL-CAP ] ========================================//
exports.mergeCSVFile_SmallCap = async (req, resp) => {
    const { cap } = req.query
    const capKey = cap?.toUpperCase()
    if (!capKey) {
        return resp.status(400).json({ success: false, message: 'Missing or invalid "cap" query parameter' });
    }
    try {
        const data = await readerFileService.mergeCSVFile(capKey)
        if (!data.success) {
            return resp.status(data.status || 500).json(data);
        }
        return resp.status(200).json(data);
    } catch (err) {
        return resp.status(500).json(err)
    }

}