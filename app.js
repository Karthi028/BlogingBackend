const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorhandler');
const userRouter = require('./routers/userRouter');
const postRouter = require('./routers/postRouter');
const commentsRouter = require('./routers/commentsRouter');
const webhookRouter = require('./routers/webhookRouter');
const { clerkMiddleware, requireAuth } = require('@clerk/express');
const cors = require('cors');
const draftpostRouter = require('./routers/draftpostRouter');


const app = express();

app.use(cors());

app.use('/api/v1/webhooks', webhookRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger);

app.use('/api/v1/users', requireAuth(), userRouter)
app.use('/api/v1/posts', postRouter)
app.use('/api/v1/Dposts', requireAuth(), draftpostRouter)
app.use('/api/v1/comments', commentsRouter)


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