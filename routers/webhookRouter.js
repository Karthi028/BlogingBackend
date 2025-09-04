const express = require('express')
const bodyParser = require('body-parser')
const {clerkHook} = require('../controllers/webhookController')

const webhookRouter = express.Router()

webhookRouter.post('/clerk',bodyParser.raw({ type: 'application/json' }),clerkHook)

module.exports = webhookRouter