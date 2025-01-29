"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeStreamAnimeById = exports.scrapeAnimeById = exports.fetchAnimesTerbaru = exports.fetchBatchAnimes = exports.scrapeAnimeList = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const scrapeAnimeList = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.default.get(url);
        const $ = cheerio.load(data);
        const animes = [];
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
    }
    catch (error) {
        console.error('Error fetching the anime list:', error);
        throw new Error('Failed to scrape anime list');
    }
});
exports.scrapeAnimeList = scrapeAnimeList;
// Fetch batch animes from the page
const fetchBatchAnimes = (url_1, ...args_1) => __awaiter(void 0, [url_1, ...args_1], void 0, function* (url, page = 1) {
    const allBatches = [];
    let currentPage = page;
    let totalPages = 1; // Default, akan diperbarui saat menemukan total halaman
    try {
        // Mengambil halaman yang sesuai berdasarkan currentPage
        const { data } = yield axios_1.default.get(`${url}/daftar-batch/page/${currentPage}/`);
        const $ = cheerio.load(data);
        const batches = [];
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
            const genres = [];
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
    }
    catch (error) {
        console.error('Error fetching batch animes:', error);
        throw new Error('Failed to fetch batch animes');
    }
});
exports.fetchBatchAnimes = fetchBatchAnimes;
const fetchAnimesTerbaru = (url_1, ...args_1) => __awaiter(void 0, [url_1, ...args_1], void 0, function* (url, page = 1) {
    const allAnimes = [];
    let currentPage = page;
    let totalPages = 1; // Default, akan diperbarui saat menemukan total halaman
    try {
        // Mengambil halaman yang sesuai berdasarkan currentPage
        const { data } = yield axios_1.default.get(`${url}/anime-terbaru/page/${currentPage}/`);
        const $ = cheerio.load(data);
        const animes = [];
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
    }
    catch (error) {
        console.error('Error fetching batch animes:', error);
        throw new Error('Failed to fetch batch animes');
    }
});
exports.fetchAnimesTerbaru = fetchAnimesTerbaru;
const scrapeAnimeById = (url, animeId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.default.get(`${url}/anime/${animeId}`);
        const $ = cheerio.load(data);
        // Mengambil judul anime
        const title = $('h1.entry-title').text().trim();
        if (!title)
            return null; // Jika title tidak ditemukan, kembalikan null
        // Mengambil judul anime Japanse
        const japanse = $('span:has(b:contains("Japanese"))').text().replace('Japanese', '').trim();
        // Mengambil synonyms
        const synonyms = $('span:has(b:contains("Synonyms"))').text().replace('Synonyms', '').trim();
        // Mengambil batch anime
        const listbatch = [];
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
        const genres = [];
        $('div.genre-info a').each((_, elem) => {
            const name = $(elem).text().trim();
            const samehadakuLink = $(elem).attr('href') || '#'; // Link asli dari Samehadaku
            const link = new URL(samehadakuLink).pathname;
            const genreId = link.split('/').pop() || ''; // Mendapatkan genreId dari link
            if (name)
                genres.push({ name, samehadakuLink, link, genreId });
        });
        // Mengambil sinopsis anime
        const synopsis = $('.entry-content p').first().text().trim();
        // Mengambil daftar episode
        const episodes = [];
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
    }
    catch (error) {
        console.error('Error scraping anime details:', error);
        return null; // Jika terjadi error saat scrape, kembalikan null
    }
});
exports.scrapeAnimeById = scrapeAnimeById;
const scrapeStreamAnimeById = (url, animeId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.default.get(`${url}/${animeId}`);
        const $ = cheerio.load(data);
        // Mengambil judul anime
        const title = $('div.lm h1.entry-title').text().trim();
        if (!title)
            return null; // Jika title tidak ditemukan, kembalikan null
        const release = $('span.time-post').text().trim();
        const servers = [];
        $('#server .east_player_option').each((_, elem) => {
            const name = $(elem).find('span').text().trim(); // Ambil nama server (misal: "Blogspot 360p")
            const nume = $(elem).attr('data-nume') || ''; // Ambil nomor server
            const type = $(elem).attr('data-type') || ''; // Ambil tipe player (misal: "schtml")
            if (name && nume) {
                servers.push({ name, nume, type });
            }
        });
        return { title, release, servers };
    }
    catch (error) {
        console.error('Error scraping anime stream:', error);
        return null; // Jika terjadi error saat scrape, kembalikan null
    }
});
exports.scrapeStreamAnimeById = scrapeStreamAnimeById;
