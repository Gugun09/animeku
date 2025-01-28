import express from 'express';

import { getAnimes, getBatchAnimes } from '../controllers/home.controller';

const router = express.Router();

// Route untuk mendapatkan daftar anime
router.get('/home', getAnimes);

// Route untuk mendapatkan batch anime dengan pagination
router.get('/batch', getBatchAnimes);

export default router;
