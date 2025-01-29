import express from 'express';
import { getAnimes, getBatchAnimes, getAnimesTerbaru, getAnimeById, getStreamAnimeById } from '../controllers/home.controller';

const router = express.Router();

// Route untuk halaman utama dengan dokumentasi API
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Anime API',
  });
});

// Route untuk mendapatkan daftar anime
router.get('/home', getAnimes);

// Route untuk mendapatkan batch anime dengan pagination
router.get('/batch', getBatchAnimes);

// Route untuk mendapatkan daftar anime terbaru
router.get('/terbaru', getAnimesTerbaru);

// Route untuk mendapatkan anime berdasarkan animeId
router.get('/anime/:animeId', getAnimeById);

// Route untuk streaming anime
router.get('/stream/:animeId', getStreamAnimeById);

export default router;
