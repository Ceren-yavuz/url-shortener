const redis = require('redis');
require('dotenv').config();

const client = redis.createClient({
    url: process.env.REDIS_URL,
});

client.on('error', (err) => {
    console.error('❌ Redis bağlantı hatası:', err);
});

client.on('connect', () => {
    console.log('✅ Redis bağlantısı başarılı.');
});

client.connect();

module.exports = client;
