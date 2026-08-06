const { getAllSongs } = require('../services/songService');

module.exports = async (req, res) => {
  try {
    const songs = await getAllSongs();
    res.status(200).json({ success: true, data: songs });
  } catch (error) {
    console.error('Error di api/songs.js:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data lagu'
    });
  }
};