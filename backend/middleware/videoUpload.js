const multer = require('multer')
const fs = require('fs')
const path = require('path')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Create 'uploads' folder if it doesn't exist
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads');
        }

        // Create 'uploads/videos' folder if it doesn't exist
        if (!fs.existsSync('uploads/videos')) {
            fs.mkdirSync('uploads/videos');
        }
        cb(null, 'uploads/videos')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    },
})
const videoUpload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        let ext = path.extname(file.originalname);
        if (ext != '.mkv' && ext != '.mp4') {
            return cb(new Error('Only video are allowed'))
        }
        cb(null, true)
    }
})

module.exports = videoUpload