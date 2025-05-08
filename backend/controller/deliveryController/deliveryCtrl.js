const { default: mongoose } = require("mongoose");
const volumnDeliverySchema = require("../../model/delivery/delivery.model");
const readerFileService = require("../../services/fileReadingServices");

const fs = require('fs')

exports.insertLDeliveryStockInBulk = async (req, resp) => {
    try {
        const excelBuffer = req.file.path;
        const excelInfo = await readerFileService.EXCELReader(excelBuffer, 'delivery')
        const stocks = excelInfo
        if (stocks.length > 0) {
            const newModifiedWithIdStocksLists = await volumnDeliverySchema.insertMany(stocks);
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

exports.getDeliveryStock = async (req, resp) => {
    try {
        const stocks = await volumnDeliverySchema.find({}, { __v: 0 });
        const formattedData = stocks.map(item => {
            const { _id, ...items } = item;
            return { ...items._doc, _id: _id };
        });
        resp.status(200).json(formattedData);
    } catch (error) {
        console.error('Error fetching stocks:', error);
        resp.status(500).send('Error fetching stocks');
    }

}

exports.updateDeliveryById = async (req, resp) => {
    // const id = req.params._id
    const { stockName, volumnDeliveryData } = req.body;
    try {
        const updatedStock = await volumnDeliverySchema.findOneAndUpdate(
            { stockName },
            { volumnDeliveryData },
            { new: true, upsert: true }
        )
        resp.status(200).json(updatedStock);
    } catch (err) {
        resp.status(500).json({ err: 'Internal server error' });
    }

}

exports.deleteDeliveryById = async (req, resp) => {
    const id = req.params._id
    try {
        const document = await volumnDeliverySchema.findById(id);
        if (!document) {
            return resp.status(404).json({ err: 'Document not found' });
        }
        const deleteStatus = await volumnDeliverySchema.deleteOne({ _id: id })
        console.log(deleteStatus)
        resp.status(200).json('Deleted successfully');
    } catch (err) {
        resp.status(500).json({ err: 'Internal server error' });
    }
}



















// =-------------------------------------------------------------------------------------------------------------------------------- //
// ============================================= DATABASE OPERATION EXCUTE HERE ============================================ //
//  DELETE 

exports.deleteOrTruncateTable = async (req, resp) => {
    try {
        const db = mongoose.connection;
        const collection = db.collection('deliveryschemas'); // Ensure the collection name matches exactly
        // console.log(collection); // Logging to check if the collection is retrieved
        await collection.deleteMany({});
        resp.status(200).json('Table rows data successfully delete');
    } catch (error) {
        console.error('Error truncating collection:', error);
    }

}












