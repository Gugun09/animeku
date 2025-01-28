import axios from 'axios';
import * as cheerio from 'cheerio';

export interface Anime {
  title: string;
  episode: string;
  link: string;
  animeId: string;
  postedBy: string;
  releasedOn: string;
  imageUrl: string;
}

export interface BatchAnime {
  title: string;
  link: string;
  animeId: string;
  imageUrl: string;
  rating: string;
  type: string;   // TV, Movie, etc.
  status: string; // Completed, Ongoing, etc.
  genres: string[];
}

export const scrapeAnimeList = async (url: string): Promise<Anime[]> => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const animes: Anime[] = [];

    $('div.post-show ul li').each((i, elem) => {
      const title = $(elem).find('h2.entry-title a').text().trim();
      const episode = $(elem).find('span > b:contains("Episode")').next('author').text().trim();
      const link = $(elem).find('h2.entry-title a').attr('href') || '';
      const animeId = link.split('/').filter(Boolean).pop() || '';
      const postedBy = $(elem).find('span.author').text().trim();
      const releasedOn = $(elem).find('span > b:contains("Released on")').parent().text().replace('Released on:', '').trim();
      const imageUrl = $(elem).find('img.npws').attr('src') || '';

      if (title && episode && link && animeId && postedBy && releasedOn && imageUrl) {
        animes.push({ title, episode, link, animeId, postedBy, releasedOn, imageUrl });
      }
    });

    return animes;
  } catch (error) {
    console.error('Error fetching the anime list:', error);
    throw new Error('Failed to scrape anime list');
  }
};

// Fetch batch animes from the page
export const fetchBatchAnimes = async (url: string, page: number = 1): Promise<{ data: BatchAnime[], pagination: any }> => {
  const allBatches: BatchAnime[] = [];
  let currentPage = page;
  let totalPages = 1; // Default, akan diperbarui saat menemukan total halaman

  try {
    // Mengambil halaman yang sesuai berdasarkan currentPage
    const { data } = await axios.get(`${url}/daftar-batch/page/${currentPage}/`);
    const $ = cheerio.load(data);
    const batches: BatchAnime[] = [];

    // Mengambil semua elemen anime dalam class .animepost
    $('.animepost').each((i, elem) => {
      const title = $(elem).find('h2').text().trim(); // Judul anime
      const link = $(elem).find('a').attr('href') || ''; // Link anime
      const animeId = link.split('/').filter(Boolean).pop() || ''; // Menyaring animeId dari link
      const imageUrl = $(elem).find('img').attr('src') || ''; // URL gambar
      const rating = $(elem).find('.score').text().trim() || ''; // Rating anime
      const type = $(elem).find('.type').first().text().trim() || ''; // Type (TV, Movie, etc.)
      const status = $(elem).find('.data .type').text().trim() || ''; // Status (Completed, Ongoing, etc.)
      
      // Mengambil genre dalam elemen .genres
      const genres: string[] = [];
      $(elem).find('.genres .mta a').each((_, genreElem) => {
        const genre = $(genreElem).text().trim();
        if (genre && !genres.includes(genre)) { // Pastikan genre tidak duplikat
          genres.push(genre);
        }
      });

      if (title && link && animeId && imageUrl) {
        batches.push({ title, link, animeId, imageUrl, rating, type, status, genres });
      }
    });

    // Mengambil informasi pagination
    const paginationText = $('.pagination span').first().text();
    const totalPagesMatch = paginationText.match(/Page (\d+) of (\d+)/);
    if (totalPagesMatch) {
      totalPages = parseInt(totalPagesMatch[2], 10); // Ambil jumlah total halaman dari teks
    }

    // Menyusun objek pagination
    const pagination = {
      currentPage,
      hasPrevPage: currentPage > 1,
      prevPage: currentPage > 1 ? currentPage - 1 : null,
      hasNextPage: currentPage < totalPages,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
      totalPages,
    };

    // Mengembalikan data dan pagination
    return { data: batches, pagination };

  } catch (error) {
    console.error('Error fetching batch animes:', error);
    throw new Error('Failed to fetch batch animes');
  }
};
