const express = require('express');
const { register } = require('../controllers/authcontroller');

const Authrouter = express.Router();

Authrouter.get('/register',register)

module.exports = Authrouter;