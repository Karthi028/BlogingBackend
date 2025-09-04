const express = require('express');
const { getUserSavedPost, savePost, getSubscriptions, subscribe, unsubscribe, getNotifications } = require('../controllers/userController');
const { requireAuth } = require('@clerk/express');

const userRouter = express.Router();

userRouter.get('/saved',getUserSavedPost)
userRouter.put('/save',savePost)
userRouter.post('/subscribe/:bloggerId',subscribe)
userRouter.post('/unsubscribe/:bloggerId',unsubscribe)
userRouter.get('/subscriptions',requireAuth(),getSubscriptions)
userRouter.get('/notifications',requireAuth(),getNotifications)

module.exports = userRouter;