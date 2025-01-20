const express = require('express');
const auth = require('../middleware/auth');
const listController = require('../controllers/listController');

const router = express.Router();

router.use(auth.protect); // All list routes require authentication
router.use(express.json());
router.post('/', listController.createList);
router.get('/user/:userId', listController.getUserLists);
router.get('/followed', listController.getFollowedLists);

router
  .route('/:id')
  .patch(listController.updateList)
  .delete(listController.deleteList);

router
  .route('/:id/follow')
  .post(listController.followList)
  .delete(listController.unfollowList);

module.exports = router;