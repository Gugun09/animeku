"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnimesTerbaru = exports.getBatchAnimes = exports.getAnimes = void 0;
const home_service_1 = require("../services/home.service");
const url = 'https://samehadaku.mba';
const getAnimes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const animes = yield (0, home_service_1.scrapeAnimeList)(url);
        const latestAnimes = animes.filter((anime) => !anime.episode.toLowerCase().includes('batch') && !anime.episode.toLowerCase().includes('end'));
        const batchAnimes = animes.filter((anime) => anime.episode.toLowerCase().includes('batch') || anime.episode.toLowerCase().includes('end'));
        res.status(200).json({
            status: 'success',
            message: 'Anime list fetched successfully',
            data: { latestAnimes, batchAnimes },
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch anime list',
            error: error.message,
        });
    }
});
exports.getAnimes = getAnimes;
// Route untuk batch anime dengan pagination
const getBatchAnimes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1; // Mengambil parameter page dari query string
    try {
        const { data, pagination } = yield (0, home_service_1.fetchBatchAnimes)(url, page); // Mengambil data dan pagination
        res.status(200).json({
            success: true,
            message: 'Batch anime list fetched successfully',
            data,
            pagination,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch batch animes',
        });
    }
});
exports.getBatchAnimes = getBatchAnimes;
// Route untuk anime terbaru dengan pagination
const getAnimesTerbaru = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1; // Mengambil parameter page dari query string
    try {
        const { data, pagination } = yield (0, home_service_1.fetchAnimesTerbaru)(url, page); // Mengambil data anime terbaru
        res.status(200).json({
            success: true,
            message: 'Latest anime list fetched successfully',
            data,
            pagination,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch latest animes',
        });
    }
});
exports.getAnimesTerbaru = getAnimesTerbaru;
