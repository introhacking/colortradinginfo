const express = require('express')
const { masterScreenController } = require('../../controller/masterScreenC/masterScreen')
const masterRoute = express.Router()


masterRoute.get('/master-screen', masterScreenController)

module.exports = masterRoute;