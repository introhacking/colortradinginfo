const express = require('express');
const { getResearchDetails } = require('../../controller/researchController/researchCtrl');
const researchRouter = express.Router();


// [ POST ]
// researchRouter.post('/research', getBankingManagementDetails);
// [ GET ]
researchRouter.get('/research', getResearchDetails);


module.exports = researchRouter;