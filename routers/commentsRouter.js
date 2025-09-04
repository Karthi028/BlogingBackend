const express = require('express');
const { getcomments, addComment, deleteComment, editComment, isSpam, restoreSpam } = require('../controllers/commentController');
const { clerkMiddleware } = require('@clerk/express');

const commentsRouter = express.Router();

commentsRouter.get('/:postId',getcomments)
commentsRouter.post('/:postId',addComment)
commentsRouter.put('/:Id',editComment)
commentsRouter.delete('/:Id',deleteComment)
commentsRouter.put('/:commentId/spam',isSpam)
commentsRouter.put('/:commentId/restore',restoreSpam)

module.exports = commentsRouter
