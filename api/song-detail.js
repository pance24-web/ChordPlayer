const { getSongById, parseSongId } = require('../services/songService');

module.exports = async (req, res) => {
  try {
    const { id } = req.query;
    const songId = parseSongId(id);
    if (songId === null) {
      return res.status(400).json({
        success: false,
        message: 'Parameter ID harus berupa bilangan bulat positif'
      });
    }

    const song = await getSongById(songId);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Lagu tidak ditemukan'
      });
    }

    res.status(200).json({ success: true, data: song });
  } catch (error) {
    console.error('Error di api/song-detail.js:', error);
    const statusCode = process.env.NODE_ENV === 'production' ? 503 : 500;
    res.status(statusCode).json({
      success: false,
      message: statusCode === 503 ? 'Database tidak tersedia' : 'Gagal mengambil data lagu'
    });
  }
};