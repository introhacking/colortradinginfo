const Sectorial = require("../../model/sectorial/sectorIal.model");
const readerFileService = require("../../services/fileReadingServices");
const fs = require('fs')



exports.createSectorDetails = async (req, resp) => {
    const { sectorialName } = req.body;
    try {

        const files = req.files;
        const existingSector = await Sectorial.findOne({ sectorialName });
        if (existingSector) {
            return resp.status(400).json({ message: 'Sector already exists' });
        }

        const imageData = await readerFileService.sectorialImportImgTable(files);
        // console.log(imageData)

        const newSectorial = new Sectorial({
            sectorialName,
            imageData,
        });
        await newSectorial.save();

        // console.log('Sectorial created:', newSectorial);
        resp.status(201).json({ message: `${sectorialName} created successfully ` });

    } catch (error) {
        console.error('Error creating sectorial:', error);
        resp.status(500).json({ message: 'Internal server error' });
    }
};

// GET controller to fetch all sectorial data
exports.getSectorialDetails = async (req, res) => {
    try {
        const sectorialData = await Sectorial.find();
        res.status(200).json(sectorialData);
    } catch (err) {
        console.error('Error fetching sectorial data', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};