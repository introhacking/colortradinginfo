const express = require('express');
const router = express.Router();
const authController = require('../../controller/authController/authCtrl');

// [ GET ] 
router.get('/users', authController.getUsers);
// [ POST ]
router.post('/login', authController.login);
// [ POST ]
router.post('/create-auth', authController.createLoginUser);
// [ PUT ]
router.put('/verify-user/:userId', authController.verifyUserByAdmin);
// [ POST ]
router.post('/disclaimer', authController.updateUserDisclaimer);
// [ DELETE ]
router.delete('/user/:userId', authController.deleteUserByAdmin);
// [ POST ]
router.post('/disclaimer', authController.updateUserDisclaimer);

module.exports = router;
