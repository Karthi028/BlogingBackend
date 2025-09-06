const express = require('express');
const { getUserSavedPost, savePost, getSubscriptions, subscribe, unsubscribe, getNotifications, updateBio, syncUser } = require('../controllers/userController');

const userRouter = express.Router();

userRouter.get('/saved', getUserSavedPost)
userRouter.put('/save', savePost)
userRouter.post('/subscribe/:bloggerId', subscribe)
userRouter.post('/unsubscribe/:bloggerId', unsubscribe)
userRouter.get('/subscriptions', getSubscriptions)
userRouter.get('/notifications', getNotifications)
userRouter.put('/bio', updateBio);
userRouter.post('/sync-user',syncUser);

module.exports = userRouter;