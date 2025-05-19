const mongoose = require('mongoose');
const midCapSchema = require("../../model/sentimentals/midCap.model");
const readerFileService = require("../../services/fileReadingServices");
const fs = require('fs')


exports.insertMidCapStocksInBulk = async (req, resp) => {
    try {
        const excelBuffer = req.file.path;
        const excelInfo = await readerFileService.EXCELReader(excelBuffer)
        const stocks = excelInfo
        if (stocks.length > 0) {
            const newModifiedWithIdStocksLists = await midCapSchema.insertMany(stocks);
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


exports.getMidCapStock = async (req, resp) => {
    try {
        const stocks = await midCapSchema.find();
        resp.status(200).json(stocks);
    } catch (error) {
        console.error('Error fetching stocks:', error);
        resp.status(500).send('Error fetching stocks');
    }

}

exports.updatingMidCapStockById = async (req, resp) => {
    // const id = req.params._id
    const { stockName, monthlyData } = req.body;
    // console.log(req.body)
    try {
        const updatedStock = await midCapSchema.findOneAndUpdate(
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

exports.deleteMidCapStockById = async (req, resp) => {
    const id = req.params._id
    try {
        const document = await midCapSchema.findById(id);
        if (!document) {
            return resp.status(404).json({ err: 'Document not found' });
        }
        const deleteStatus = await midCapSchema.deleteOne({ _id: id })
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
        resp.json({ status: 200, success: true, response: data })

    } catch (err) {
       throw err
    }
}




// =-------------------------------------------------------------------------------------------------------------------------------- //
// ============================================= DATABASE OPERATION EXCUTE HERE ============================================ //
//  DELETE 

exports.deleteOrTruncateTable = async (req, resp) => {

    try {
        const db = mongoose.connection;
        const collection = db.collection('midstockschemas'); // Ensure the collection name matches exactly
        // console.log(collection); // Logging to check if the collection is retrieved
        await collection.deleteMany({});
        resp.status(200).json('Table rows data successfully delete');
    } catch (error) {
        console.error('Error truncating collection:', error);
    }

}