require('dotenv').config();

// Middleware untuk verifikasi API Key
// Gunakan di route yang sensitive (POST, PUT, DELETE)
// Contoh: router.post('/', checkApiKey, createSong);

const checkApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API Key tidak disediakan. Tambahkan header "x-api-key"'
    });
  }

  if (apiKey !== validKey) {
    return res.status(403).json({
      success: false,
      message: 'API Key tidak valid'
    });
  }

  // API Key valid, lanjut ke handler selanjutnya
  next();
};

module.exports = checkApiKey;