const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getLeaderboard } = require('../controllers/leaderboardController');

const router = express.Router();
router.use(authMiddleware);
router.get('/', getLeaderboard);

module.exports = router;
