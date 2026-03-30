const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { listItems, purchase, equip } = require('../controllers/shopController');

const router = express.Router();
router.use(authMiddleware);

router.get('/items', listItems);
router.post('/purchase/:itemId', purchase);
router.post('/equip/:itemId', equip);

module.exports = router;
