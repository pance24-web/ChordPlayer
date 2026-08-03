const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const songRoutes = require("./routes/songRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Konfigurasi CORS — hanya izinkan origin tertentu
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.ALLOWED_ORIGIN // saat production, ambil dari .env
      : "*", // saat development, bebas (biar mudah testing)
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "x-api-key"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend statis (index.html, detail.html, script.js, css/, asset/)
app.use(express.static(path.join(__dirname, "public")));

// Routes API
app.use("/api/songs", songRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
