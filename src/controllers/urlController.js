const { encodeBase62 } = require('../utils/shortCodeGenerator');
const pool = require('../config/database'); // 🔧 burada düzeltildi
const { saveAnalytics } = require('../models/analyticsModel');
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
    }

    try {
        const now = new Date();
        // 1. Kayıt ekle, short_code boş bırak
        const insert = await pool.query(
            `INSERT INTO urls (original_url, short_code, created_at, is_active)
             VALUES ($1, '', $2, $3)
                 RETURNING id`,
            [original_url, now, true]
        );

        const insertedId = insert.rows[0].id;

        // 2. Short code üret
        if (!shortCode) {
            shortCode = encodeBase62(insertedId);
        }

        // 3. Short code'u güncelle
        await pool.query(
            `UPDATE urls SET short_code = $1 WHERE id = $2`,
            [shortCode, insertedId]
        );

        // 4. Sonuçları getir ve döndür
        const result = await pool.query(`SELECT * FROM urls WHERE id = $1`, [insertedId]);

        return res.status(201).json({
            short_url: `${req.protocol}://${req.get('host')}/${shortCode}`,
            ...result.rows[0],
        });
    } catch (err) {
        console.error('URL kaydı sırasında hata:', err);
        return res.status(500).json({ error: 'Sunucu hatası.' });
    }
};


const redirectUrl = async (req, res) => {
    const shortCode = req.params.short_code;

    try {
        const result = await pool.query(
            'SELECT * FROM urls WHERE short_code = $1 AND is_active = true',
            [shortCode]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'URL bulunamadı.' });
        }

        const urlData = result.rows[0];

        // Expiration kontrolü
        if (urlData.expires_at && new Date() > new Date(urlData.expires_at)) {
            return res.status(410).json({ error: 'Bu URL süresi dolmuş.' });
        }

        // Tıklama sayısını artır
        await pool.query(
            'UPDATE urls SET click_count = click_count + 1 WHERE id = $1',
            [urlData.id]
        );

        await saveAnalytics({
            urlId: urlData.id,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            referer: req.get('Referer') || 'direct'
        });

        // Redirect et
        return res.redirect(urlData.original_url);

    } catch (err) {
        console.error('Redirect sırasında hata:', err);
        return res.status(500).json({ error: 'Sunucu hatası.' });
    }
};

module.exports = { shortenUrl,redirectUrl, };
