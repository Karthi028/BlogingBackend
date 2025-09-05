const express = require('express');
const { getPosts, getPost, createPost, deletePost, imgUpload, featurePost, updateTags, likePosts } = require('../controllers/postsController');
const increasseVisit = require('../middlewares/increaseVisit');
const { requireAuth } = require('@clerk/express');

const postRouter = express.Router();


postRouter.get('/upload', imgUpload)
postRouter.post('/', requireAuth(), createPost);
postRouter.get('/', getPosts);
postRouter.get('/:slug', increasseVisit, getPost);
postRouter.put('/:slug', requireAuth(), updateTags);
postRouter.delete('/:id', requireAuth(), deletePost);
postRouter.put('/feature/Star', requireAuth(), featurePost);
postRouter.put('/like/:postId', requireAuth(), likePosts);

module.exports = postRouter