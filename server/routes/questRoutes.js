const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const {
  listQuests,
  getQuest,
  startQuest,
  completeQuest,
  lessonComplete,
} = require('../controllers/questController');

const router = express.Router();
router.use(authMiddleware);

router.get('/', listQuests);
router.get('/:id', getQuest);
router.post('/:id/start', startQuest);
router.post('/:id/lesson-complete', lessonComplete);
router.post('/:id/complete', completeQuest);

module.exports = router;
