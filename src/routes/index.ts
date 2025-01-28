import express from 'express';
import animeRoutes from './home.routes';

const router = express.Router();

router.use(animeRoutes);

export default router;
