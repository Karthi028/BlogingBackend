const express = require('express')
const { clerkHook } = require('../controllers/webhookController')
const bodyParser = require('body-parser')

const webhookRouter = express.Router()

webhookRouter.post('/clerk', bodyParser.raw({ type: 'application/json' }), clerkHook)

module.exports = webhookRouter