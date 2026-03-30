const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { submitChallenge, getDaily, submitDaily } = require('../controllers/challengeController');

const router = express.Router();
router.use(authMiddleware);

router.get('/daily', getDaily);
router.post('/daily/submit', submitDaily);
router.post('/:id/submit', submitChallenge);

module.exports = router;
