"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes")); // Routes API yang sudah kamu buat sebelumnya
const app = (0, express_1.default)();
// Middleware untuk JSON parsing
app.use(express_1.default.json());
// Route untuk halaman root yang memberikan dokumentasi API dalam bentuk HTML
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public', 'index.html'));
});
// Gunakan route API dengan prefix '/api'
app.use('/api', routes_1.default);
exports.default = app;
