const express = require("express");
const router = express.Router();
const checkApiKey = require("../middleware/auth"); // ✅ import middleware
const {
  getAllSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong,
} = require("../controllers/songController");

// ✅ Endpoint GET tetap publik — siapapun boleh melihat lagu
router.get("/", getAllSongs);
router.get("/:id", getSongById);

// ✅ Endpoint yang MENGUBAH data wajib pakai API key
router.post("/", checkApiKey, createSong);
router.put("/:id", checkApiKey, updateSong);
router.delete("/:id", checkApiKey, deleteSong);

module.exports = router;
