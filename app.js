const express = require('express');
const Authrouter = require('./routers/authrouter');
const cookieParser = require('cookie-parser');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorhandler');



const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(logger)

app.use('/api/v1/auth', Authrouter)

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});

app.use(errorHandler)

app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

module.exports = app;