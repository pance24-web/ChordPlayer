const { getAllSongs } = require('../services/songService');

module.exports = async (req, res) => {
  try {
    const songs = await getAllSongs();
    res.status(200).json({ success: true, data: songs });
  } catch (error) {
    console.error('Error di api/songs.js:', error);
    const statusCode = process.env.NODE_ENV === 'production' ? 503 : 500;
    res.status(statusCode).json({
      success: false,
      message: statusCode === 503 ? 'Database tidak tersedia' : 'Gagal mengambil data lagu'
    });
  }
};