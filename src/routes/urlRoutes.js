const express = require('express');
const router = express.Router();
const { shortenUrl } = require('../controllers/urlController');
const rateLimiter = require('../middleware/rateLimiter');
// POST /api/shorten
router.post('/shorten', shortenUrl,rateLimiter);

module.exports = router;
