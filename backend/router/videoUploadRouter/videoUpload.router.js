const express = require('express');
const { getAllVideoLists, postVideoList } = require('../../controller/videoUploadController/video.media.controller');
const videoUpload = require('../../middleware/videoUpload');

const router = express.Router()

router.get('/media/all', getAllVideoLists);
router.post('/media', videoUpload.fields([{ name: 'videos', maxCount: 1 }]), postVideoList);

module.exports = router;