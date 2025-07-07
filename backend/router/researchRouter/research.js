const express = require('express');
const { getResearchDetails, postResearchItem, getDataBasedUponId, deleteResearchById, updateResearchById } = require('../../controller/researchController/researchCtrl');
const { upload, uploadMultiImg } = require('../../middleware/fileUpload');
const researchRouter = express.Router();


// [ POST ]
researchRouter.post('/research', uploadMultiImg.single('chart'), postResearchItem);
// [ GET ]
researchRouter.get('/research', getResearchDetails);
// [ GET/:id ]
researchRouter.get('/research/:_id', getDataBasedUponId);
// [ UPDATE/:id ]
researchRouter.put('/research/:_id', uploadMultiImg.single('chart'), updateResearchById);
// [ DELETE/:id ]
researchRouter.delete('/research/:_id', deleteResearchById)


module.exports = researchRouter;