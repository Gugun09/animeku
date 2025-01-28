import express from 'express';

import { getAnimes, getBatchAnimes, getAnimesTerbaru } from '../controllers/home.controller';

const router = express.Router();

// Route untuk mendapatkan daftar anime
router.get('/home', getAnimes);

// Route untuk mendapatkan batch anime dengan pagination
router.get('/batch', getBatchAnimes);

router.get('/terbaru', getAnimesTerbaru);

export default router;
