const readerFileService = require("../../services/fileReadingServices");

const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');



// GET
exports.getDataFromURL = async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }
    try {
        const data = await readerFileService.fetchCSVData(url);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


// GET
exports.getDataFromURL2 = async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }
    try {
        const data = await readerFileService.fetchDataFromCSV(url);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


// GET [REQUEST A FILE TO READ DATA AND SEND TO RESPONSE]
exports.getDataFromURL2Data = async (req, res) => {
    try {
        const fileName = req.query.file;
        if (!fileName) {
            return res.status(400).json({ error: 'File is required' });
        }

        const filePath = path.join(__dirname, '../../uploads/csvfilefolder', fileName);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'CSV file not found' });
        }

        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                res.json(results);
            })
            .on('error', (err) => {
                console.error('CSV Read Error:', err);
                res.status(500).json({ error: 'Failed to read CSV' });
            });

    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).json({ error: err.message });
    }
};
