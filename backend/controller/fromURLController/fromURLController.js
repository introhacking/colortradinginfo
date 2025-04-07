const readerFileService = require("../../services/fileReadingServices");

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
