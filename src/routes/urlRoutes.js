const express = require('express');
const router = express.Router();
const { shortenUrl } = require('../controllers/urlController');

// POST /api/shorten
router.post('/shorten' ,shortenUrl);

module.exports = router;
