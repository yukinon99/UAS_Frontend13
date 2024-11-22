const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = 3000;

// Koneksi ke MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Berhasil terhubung ke MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Gagal terhubung ke MongoDB Atlas:', error);
  });

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
}); 