const multer = require('multer');
const fs = require('fs');
// Multer
const storage = multer.memoryStorage();
const uploadMultiImg = multer({ storage: storage });

const upload = multer({ dest: 'uploads/' })

// module.exports =  upload.single('excelSheet');
module.exports = {
    upload,
    uploadMultiImg
}