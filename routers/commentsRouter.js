const express = require('express');
const { getcomments, addComment, deleteComment, editComment, isSpam, restoreSpam } = require('../controllers/commentController');
const { requireAuth } = require('@clerk/express');

const commentsRouter = express.Router();

commentsRouter.get('/:postId',getcomments)
commentsRouter.post('/:postId',requireAuth(),addComment)
commentsRouter.put('/:Id',requireAuth(),editComment)
commentsRouter.delete('/:Id',requireAuth(),deleteComment)
commentsRouter.put('/:commentId/spam',requireAuth(),isSpam)
commentsRouter.put('/:commentId/restore',requireAuth(),restoreSpam)

module.exports = commentsRouter
