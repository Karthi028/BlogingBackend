const express = require('express');
const { createDraft, getDrafts, getDraft, updateDraft, deleteDraft } = require('../controllers/postsController');

const draftpostRouter = express.Router();


draftpostRouter.post('/drafts',createDraft);
draftpostRouter.get('/drafts',getDrafts);
draftpostRouter.get('/drafts/:id',getDraft);
draftpostRouter.put('/drafts/:id',updateDraft);
draftpostRouter.delete('/drafts/:id',deleteDraft);


module.exports = draftpostRouter