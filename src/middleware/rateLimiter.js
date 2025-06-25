const redisClient = require('../config/redis');

const RATE_LIMIT = 5; // saniyede en fazla 5 istek
const WINDOW_SIZE = 1; // saniye

const rateLimiter = async (req, res, next) => {
    try {
        const ip = req.ip;
        const key = `rate:${ip}`;

        const current = await redisClient.get(key);

        if (current && parseInt(current) >= RATE_LIMIT) {
            return res.status(429).json({ error: 'Çok fazla istek attınız, lütfen biraz bekleyin.' });
        }

        if (current) {
            await redisClient.incr(key);
        } else {
            await redisClient.set(key, 1, { EX: WINDOW_SIZE });
        }

        next();
    } catch (err) {
        console.error('Rate limiter hatası:', err);
        return res.status(500).json({ error: 'Rate limit kontrolü yapılamadı.' });
    }
};

module.exports = rateLimiter;
