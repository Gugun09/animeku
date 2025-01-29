import { Request, Response } from 'express';
import { scrapeAnimeList,  fetchBatchAnimes, fetchAnimesTerbaru, scrapeAnimeById, scrapeStreamAnimeById } from '../services/home.service';

const url = 'https://samehadaku.mba';

export const getAnimes = async (req: Request, res: Response) => {
  try {
    const animes = await scrapeAnimeList(url);

    const latestAnimes = animes.filter(
      (anime) => !anime.episode.toLowerCase().includes('batch') && !anime.episode.toLowerCase().includes('end')
    );
    const batchAnimes = animes.filter(
      (anime) => anime.episode.toLowerCase().includes('batch') || anime.episode.toLowerCase().includes('end')
    );

    res.status(200).json({
      status: 'success',
      message: 'Anime list fetched successfully',
      data: { latestAnimes, batchAnimes },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch anime list',
      error: error.message,
    });
  }
};

// Route untuk batch anime dengan pagination
export const getBatchAnimes = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1; // Mengambil parameter page dari query string

  try {
    const { data, pagination } = await fetchBatchAnimes(url, page); // Mengambil data dan pagination
    res.status(200).json({
      success: true,
      message: 'Batch anime list fetched successfully',
      data,
      pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batch animes',
    });
  }
};

// Route untuk anime terbaru dengan pagination
export const getAnimesTerbaru = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1; // Mengambil parameter page dari query string

  try {
    const { data, pagination} = await fetchAnimesTerbaru(url, page); // Mengambil data anime terbaru

    res.status(200).json({
      success: true,
      message: 'Latest anime list fetched successfully',
      data,
      pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest animes',
    });
  }
};

export const getAnimeById = async (req: Request, res: Response) => {

  try {
    const { animeId } = req.params;
    // Mengambil data anime berdasarkan animeId
    const animeDetails = await scrapeAnimeById(url, animeId);
    // Kirimkan response dengan data anime detail
    res.status(200).json({
      success: true,
      message: 'Anime details fetched successfully',
      data: animeDetails,
    });
  } catch (error) {
    console.error('Error fetching anime by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch anime details',
    });
  }
};


export const getStreamAnimeById = async (req: Request, res: Response) => {
  try {
    const { animeId } = req.params;
    // Mengambil data anime berdasarkan animeId
    const animeDetails = await scrapeStreamAnimeById(url, animeId);
    // Kirimkan response dengan data anime detail
    res.status(200).json({
      success: true,
      message: 'Anime details fetched successfully',
      data: animeDetails,
    });
  } catch (error) {
    console.error('Error fetching anime by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch anime details',
    });
  }
};