import axios from 'axios';
import * as cheerio from 'cheerio';
import { url } from 'inspector';

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

export interface AnimeTerbaru {
  title: string;
  episode: string;
  link: string;
  animeId: string;
  postedBy: string;
  releasedOn: string;
  imageUrl: string;
}

export interface Episode {
  episodeNumber: string;
  title: string;
  link: string;
  episodeId: string;
  release: string;
}

export interface AnimeDetails {
  title: string;
  animeId: string;
  japanse: string;
  synonyms: string;
  source: string;
  season: string;
  studio: string;
  producer: string;
  totalEpisodes: string;
  release: string;
  duration: string;
  imageUrl: string;
  rating: string;
  type: string;
  status: string;
  genres: { name: string; genreId: string; link: string }[];
  synopsis: string;
  listbatch: { title: string; samehadakuLink: string; link: string; batchId: string }[];
  episodes: Episode[];
}

export interface AnimeStream {
  title: string;
  release: string;
  servers: { name: string; nume: string; type: string }[];
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

export const fetchAnimesTerbaru = async (url: string, page: number = 1): Promise<{ data: AnimeTerbaru[], pagination: any }> => {
  const allAnimes: AnimeTerbaru[] = [];
  let currentPage = page;
  let totalPages = 1; // Default, akan diperbarui saat menemukan total halaman

  try {
    // Mengambil halaman yang sesuai berdasarkan currentPage
    const { data } = await axios.get(`${url}/anime-terbaru/page/${currentPage}/`);
    const $ = cheerio.load(data);
    const animes: AnimeTerbaru[] = [];

    // Mengambil semua elemen anime dalam class .post-show
    $('div.post-show ul li').each((i, elem) => {
      const title = $(elem).find('h2.entry-title a').text().trim();
      const episode = $(elem).find('span > b:contains("Episode")').next('author').text().trim();
      const link = $(elem).find('h2.entry-title a').attr('href') || '';
      const animeId = link.split('/').filter(Boolean).pop() || '';
      const postedBy = $(elem).find('span.author').text().replace('Posted by:', '').trim();
      const releasedOn = $(elem).find('span:contains("Released on")').text().replace('Released on:', '').trim();
      const imageUrl = $(elem).find('img.anmsa').attr('src') || '';

      // Pastikan semua data yang dibutuhkan ada
      if (title && episode && link && animeId && postedBy && releasedOn && imageUrl) {
        animes.push({ title, episode, link, animeId, postedBy, releasedOn, imageUrl });
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
    return { data: animes, pagination };

  } catch (error) {
    console.error('Error fetching batch animes:', error);
    throw new Error('Failed to fetch batch animes');
  }
};

export const scrapeAnimeById = async (url: string, animeId: string): Promise<AnimeDetails | null> => {

  try {
    const { data } = await axios.get(`${url}/anime/${animeId}`);
    const $ = cheerio.load(data);

    // Mengambil judul anime
    const title = $('h1.entry-title').text().trim();
    if (!title) return null; // Jika title tidak ditemukan, kembalikan null

    // Mengambil judul anime Japanse
    const japanse = $('span:has(b:contains("Japanese"))').text().replace('Japanese', '').trim();

    // Mengambil synonyms
    const synonyms = $('span:has(b:contains("Synonyms"))').text().replace('Synonyms', '').trim();

    // Mengambil batch anime
    const listbatch: { title: string; samehadakuLink: string; link: string; batchId: string }[] = [];

    $('div.listbatch a').each((_, elem) => {
      const title = $(elem).text().trim(); // Ambil teks dari <a>
      const samehadakuLink = $(elem).attr('href') || ''; // Link asli dari Samehadaku

      // Mengubah link menjadi relatif dengan hanya mengambil path setelah domain
      const link = new URL(samehadakuLink).pathname; 

      // Ambil batchId dari bagian akhir URL
      const batchId = link.split('/').filter(Boolean).pop() || '';

      if (title && samehadakuLink) {
        listbatch.push({ title, samehadakuLink, link, batchId });
      }
    });
    
    // Mengambil source
    const source = $('span:has(b:contains("Source"))').text().replace('Source', '').trim();
    
    // Mengambil season
    const season = $('span:has(b:contains("Season"))').text().replace('Season', '').trim();
    
    // Mengambil studio
    const studio = $('span:has(b:contains("Studio"))').text().replace('Studio', '').trim();
    
    // Mengambil producer
    const producer = $('span:has(b:contains("Producers"))').text().replace('Producers', '').trim();

    // Mengambil total episode
    const totalEpisodes = $('span:has(b:contains("Total Episode"))').text().replace('Total Episode', '').trim();
    
    // Mengambil release date
    const release = $('span:has(b:contains("Released"))').text().replace('Released', '').trim();

    // Mengambil URL gambar
    const imageUrl = $('.thumb img').attr('src') || '';

    // Mengambil rating anime
    const rating = $('div.rtg span[itemprop="ratingValue"]').text().trim();

    // Mengambil jenis anime (TV, Movie, OVA, dll.)
    const type = $('span:has(b:contains("Type"))').text().replace('Type', '').trim();

    // Mengambil status anime (Completed, Ongoing, dll.)
    const status = $('span:has(b:contains("Status"))').text().replace('Status', '').trim();

    // Mengambil durasi anime
    const duration = $('span:has(b:contains("Duration"))').text().replace('Duration', '').trim();

    // ✅ Mengambil genre beserta link dari `.genre-info`
    const genres: { name: string; genreId: string; samehadakuLink: string; link: string }[] = [];
    $('div.genre-info a').each((_, elem) => {
      const name = $(elem).text().trim();
      const samehadakuLink = $(elem).attr('href') || '#'; // Link asli dari Samehadaku
      const link = new URL(samehadakuLink).pathname; 
      const genreId = link.split('/').pop() || ''; // Mendapatkan genreId dari link
      if (name) genres.push({ name, samehadakuLink, link, genreId });
    });

    // Mengambil sinopsis anime
    const synopsis = $('.entry-content p').first().text().trim();

    // Mengambil daftar episode
    const episodes: Episode[] = [];
    $('div.lstepsiode.listeps ul li').each((_, elem) => {
      const episodeNumber = $(elem).find('.epsright .eps a').text().trim(); // Ambil nomor episode
      const title = $(elem).find('.epsleft .lchx a').text().trim(); // Ambil judul episode
      const link = $(elem).find('.epsright .eps a').attr('href') || ''; // Ambil link episode
      const release = $(elem).find('.epsleft .date').text().trim(); // Ambil tanggal rilis episode

      // Ambil episodeId dari URL
      const episodeId = link.split('/').filter(Boolean).pop() || ''; // Mengambil bagian akhir dari URL sebagai ID

      if (episodeNumber && title && link) {
        episodes.push({ episodeNumber, title, link, episodeId, release });
      }
    });

    return {
      title,
      animeId,
      japanse,
      synonyms,
      source,
      season,
      studio,
      producer,
      totalEpisodes,
      release,
      duration,
      imageUrl,
      rating,
      type,
      status,
      genres,
      synopsis,
      listbatch,
      episodes,
    };
  } catch (error) {
    console.error('Error scraping anime details:', error);
    return null; // Jika terjadi error saat scrape, kembalikan null
  }
};

export const scrapeStreamAnimeById = async (url: string, animeId: string): Promise<AnimeStream | null> => {
  try {
    const { data } = await axios.get(`${url}/${animeId}`);
    const $ = cheerio.load(data);

    // Mengambil judul anime
    const title = $('div.lm h1.entry-title').text().trim();
    if (!title) return null; // Jika title tidak ditemukan, kembalikan null
    const release = $('span.time-post').text().trim();

    const servers: { name: string; nume: string; type: string }[] = [];

    $('#server .east_player_option').each((_, elem) => {
      const name = $(elem).find('span').text().trim(); // Ambil nama server (misal: "Blogspot 360p")
      const nume = $(elem).attr('data-nume') || ''; // Ambil nomor server
      const type = $(elem).attr('data-type') || ''; // Ambil tipe player (misal: "schtml")

      if (name && nume) {
        servers.push({ name, nume, type });
      }
    });

    return { title, release, servers };
  } catch (error) {
    console.error('Error scraping anime stream:', error);
    return null; // Jika terjadi error saat scrape, kembalikan null
  }
}