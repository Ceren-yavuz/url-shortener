const express = require('express');
const router = express.Router();
const { shortenUrl,getUrlStats } = require('../controllers/urlController');

// POST /api/shorten
router.post('/shorten' ,shortenUrl);
router.get('/stats/:short_code', getUrlStats); // ✅ yeni route
module.exports = router;
