import express from 'express';
import path from 'path';
import routes from './routes';  // Routes API yang sudah kamu buat sebelumnya

const app = express();

// Middleware untuk JSON parsing
app.use(express.json());

// Route untuk halaman root yang memberikan dokumentasi API dalam bentuk HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gunakan route API dengan prefix '/api'
app.use('/api', routes);

export default app;

