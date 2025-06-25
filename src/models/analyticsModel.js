const pool = require('../config/database');

const saveAnalytics = async ({ urlId, ip, userAgent, referer }) => {
    try {
        await pool.query(
            `INSERT INTO analytics (url_id, ip_address, user_agent, referer)
       VALUES ($1, $2, $3, $4)`,
            [urlId, ip, userAgent, referer]
        );
    } catch (err) {
        console.error('📉 Analytics kaydı hatası:', err);
    }
};

module.exports = { saveAnalytics };
