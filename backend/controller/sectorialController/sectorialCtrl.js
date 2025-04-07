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


// exports.createSectorDetails = async (req, resp) => {
//     const { sectorialName } = req.body;
//     const files = req.files;
//     // console.log(files)
//     let sectorName = await Sectorial.findOne({ sectorialName });
//     try {
//         if (sectorName) return resp.status(404).json({ message: 'Sector all ready exit' });
//         const fileResponse = await readerFileService.sectorialImportImgTable(files)
//         const newSectorial = new Sectorial({
//             sectorialName,
//             imageData: fileResponse
//         });
//         console.log(newSectorial)

//     } catch (err) {
//         resp.status(500).json({ message: 'Internal server error' });

//     }

//     // await newSectorial.save();
//     // resp.status(200).json({ message: `${sectorialName} data uploaded successfully`, newSectorial });
//     // fs.unlink(files, (err) => {
//     //     if (err) {
//     //         return resp.status(500).send(err);
//     //     }
//     //     console.log('File deleted successfully.');
//     // })
// }

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