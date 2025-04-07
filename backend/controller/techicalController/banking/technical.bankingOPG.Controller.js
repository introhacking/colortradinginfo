const mongoose = require('mongoose');
const readerFileService = require("../../../services/fileReadingServices");
const fs = require('fs')

exports.OPGCallTechicalBankDataToCreateTable = async (req, resp) => {
    try {
        const filePath = req.file.path;
        const { results, DynamicModel } = await readerFileService.createDynamicTableOPG(filePath);
        if (results.length > 0) {
            const technicalBankingLists = await DynamicModel.insertMany(results);
            resp.status(201).send(technicalBankingLists);
        } else {
            resp.status(400).send('No technical Banking to insert');
        }
        fs.unlink(filePath, (err) => {
            if (err) {
                return resp.status(500).send(err);
            }
            console.log('File deleted successfully.');
        })
    } catch (err) {
        resp.status(500).send('Error importing data', err);
    }
};

//  GET
exports.OPGGetAllTechnicalBankData = async (req, res) => {
    try {
        const collections = await mongoose.connection.db.collections();
        // const collectionNames = collections.map(col => col.collectionName);
        // console.log(collectionNames)                                               // WE GET THE DATABASE COLLLECTION NAME       
        const collection = mongoose.connection.db.collection('techicalbankingopgs');
        const data = await collection.find({}, { projection: { __v: 0 } }).toArray();
        const formattedData = data.map(item => {
            const { _id, ...rest } = item;
            return { ...rest, _id: _id }; // Use id instead of _id
        });
        res.status(200).json(formattedData);
    } catch (error) {
        res.status(500).send('Error fetching data', error.message);
    }
};

// DELETE
exports.deleteTechnicalBankById_OPG = async (req, resp) => {
    const id = req.params._id
    try {
        const collection = mongoose.connection.db.collection('techicalbankingopgs');
        const findObjectId = new mongoose.Types.ObjectId(id)
        const responseResult = await collection.deleteOne({ _id: findObjectId })
        if (responseResult.deletedCount === 0) {
            return resp.status(404).json({ err: 'Id not found' });
        }
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
        const collection = db.collection('techicalbankingopgs'); // Ensure the collection name matches exactly
        // console.log(collection); // Logging to check if the collection is retrieved
        await collection.deleteMany({});
        resp.status(200).json('Table rows data successfully delete');
    } catch (error) {
        console.error('Error truncating collection:', error);
    }

}