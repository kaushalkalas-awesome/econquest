const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getMe, patchMe, getStats, getActivity } = require('../controllers/userController');

const router = express.Router();

router.use(authMiddleware);
router.get('/me', getMe);
router.patch('/me', patchMe);
router.get('/me/stats', getStats);
router.get('/me/activity', getActivity);

module.exports = router;
