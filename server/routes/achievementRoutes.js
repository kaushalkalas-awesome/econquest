const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { listAchievements, checkEndpoint } = require('../controllers/achievementController');

const router = express.Router();
router.use(authMiddleware);

router.get('/', listAchievements);
router.post('/check', checkEndpoint);

module.exports = router;
