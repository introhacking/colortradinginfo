const express = require('express');
const router = express.Router();
const authController = require('../../controller/authController/authCtrl');

router.post('/login', authController.login);
router.post('/create-auth', authController.createLoginUser);
router.post('/disclaimer', authController.updateUserDisclaimer);

module.exports = router;
