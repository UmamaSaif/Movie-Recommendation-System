const express = require('express');
const discussionController = require('../controllers/discussionController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', discussionController.getAllDiscussions);
router.get('/:id', discussionController.getDiscussion);
router.post('/', auth.protect, discussionController.createDiscussion);
router.post('/:id/reply', auth.protect, discussionController.addReply);
router.patch('/:id', auth.protect, discussionController.updateDiscussion);
router.delete('/:id', auth.protect, discussionController.deleteDiscussion);

module.exports = router;