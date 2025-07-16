const express = require('express');
const { getAllVideoLists, postVideoList, deleteSpecificVideo, updatingSpecificVideo, deleteOrTruncateTable } = require('../../controller/videoUploadController/video.media.controller');
const videoUpload = require('../../middleware/videoUpload');

const router = express.Router()

router.get('/media/all', getAllVideoLists);
// router.post('/media', videoUpload.fields([{ name: 'videos', maxCount: 1 }]), postVideoList);

router.post('/media', videoUpload.array('videos'), postVideoList);

router.put('/media/:id/video/text', updatingSpecificVideo);

router.delete('/media/:id/video', deleteSpecificVideo);


// TRUNCATE TABLE
router.post('/media_table', deleteOrTruncateTable)


module.exports = router;