const { getSongById } = require('../services/songService');

module.exports = async (req, res) => {
  try {
    const { id } = req.query;

    const song = await getSongById(id);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Lagu tidak ditemukan'
      });
    }

    res.status(200).json({ success: true, data: song });
  } catch (error) {
    console.error('Error di api/song-detail.js:', error);
    const statusCode = error.code === 'DB_UNAVAILABLE' ? 503 : 500;
    res.status(statusCode).json({
      success: false,
      message: statusCode === 503
        ? 'Database sedang tidak tersedia'
        : 'Gagal mengambil data lagu'
    });
  }
};