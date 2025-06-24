const express = require('express')
const { masterScreenController } = require('../../controller/masterScreen/masterScreen')
const masterRoute = express.Router()


masterRoute.get('/master-screen', masterScreenController)

module.exports = masterRoute;