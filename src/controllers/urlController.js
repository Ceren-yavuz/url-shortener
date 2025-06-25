const { encodeBase62 } = require('../utils/shortCodeGenerator');
const pool = require('../config/database'); // 🔧 burada düzeltildi
require('dotenv').config();

let idCounter = 1;

const shortenUrl = async (req, res) => {
    const { original_url, custom_alias } = req.body;

    if (!original_url || !/^https?:\/\/.+/.test(original_url)) {
        return res.status(400).json({ error: 'Geçerli bir URL girin.' });
    }

    let shortCode;
    if (custom_alias) {
        const check = await pool.query(
            'SELECT * FROM urls WHERE short_code = $1',
            [custom_alias]
        );
        if (check.rows.length > 0) {
            return res.status(409).json({ error: 'Bu alias zaten kullanılıyor.' });
        }
        shortCode = custom_alias;
    } else {
        shortCode = encodeBase62(idCounter++);
    }

    try {
        const now = new Date();
        const insert = await pool.query(
            `INSERT INTO urls (original_url, short_code, created_at, is_active)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [original_url, shortCode, now, true]
        );

        return res.status(201).json({
            short_url: `${req.protocol}://${req.get('host')}/${shortCode}`,
            ...insert.rows[0],
        });
    } catch (err) {
        console.error('URL kaydı sırasında hata:', err);
        return res.status(500).json({ error: 'Sunucu hatası.' });
    }
};

module.exports = { shortenUrl };
