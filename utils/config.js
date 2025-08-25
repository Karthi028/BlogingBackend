const { models } = require('mongoose');

require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';
const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {MONGODB_URI,PORT,JWT_SECRET,JWT_EXPIRES,NODE_ENV}