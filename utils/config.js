const { models } = require('mongoose');

require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';
const NODE_ENV = process.env.NODE_ENV || 'development';
const CLERK_SECRET = process.env.CLERK_SECRET;
const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;
const URL_FRONT = process.env.URL_FRONT

module.exports = {
    MONGODB_URI,
    PORT,
    JWT_SECRET,
    JWT_EXPIRES,
    NODE_ENV,
    CLERK_SECRET,
    IMAGEKIT_PUBLIC_KEY,
    IMAGEKIT_PRIVATE_KEY,
    IMAGEKIT_URL_ENDPOINT,
    URL_FRONT
}