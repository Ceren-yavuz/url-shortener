const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Geçici anasayfa route
app.get('/', (req, res) => {
    res.send('URL Shortener Service is running!');
});

module.exports = app;
