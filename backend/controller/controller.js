const readerFileService = require("../services/fileReadingServices")
const fs = require('fs')

// GET
const getAllQuotation = async (req, resp) => {

    // For Excel sheet 

    try {
        const excelBuffer = req.file.path;
        const excelInfo = await readerFileService.EXCELReader(excelBuffer)
        console.log(excelInfo)
        resp.status(200).json(excelInfo);
        fs.unlink(excelBuffer, (err) => {
            if (err) {
                return resp.status(500).send(err);
            }
            console.log('File deleted successfully.');
        })
    } catch (err) {
        resp.status(404).send(err)
    }

}
module.exports = {
    getAllQuotation,
}