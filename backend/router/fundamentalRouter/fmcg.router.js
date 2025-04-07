const express = require('express');
const router = express.Router();
const fmcgController = require('../../controller/fundamentals/fmcg.controller');

router.get('/fmcg', fmcgController.getAllFMCGDetails);
router.get('/fmcg/:_id', fmcgController.getFMCGById);
router.post('/fmcg', fmcgController.createFMCG);
router.put('/fmcg/_:id', fmcgController.updateFMCG);
router.delete('/fmcg/_:id', fmcgController.deleteFMCG);

module.exports = router;
