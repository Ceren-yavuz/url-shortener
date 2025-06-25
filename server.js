const express = require('express');
const app = require('./src/app');
const { redirectUrl } = require('./src/controllers/urlController');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.get('/:short_code', redirectUrl); // 🔥 yönlendirme burada

app.listen(PORT, () => {
    console.log(`🚀 Server ${PORT} portunda çalışıyor`);
});
