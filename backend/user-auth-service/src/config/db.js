// const { Pool } = require('pg');
// require('dotenv').config();

// const pool = new Pool({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME
// });

// pool.connect()
//   .then(() => console.log('✅ User DB connected'))
//   .catch(err => console.error('DB connection error', err));

// module.exports = pool;

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  retryWrites: true,
  w: 'majority'
})
  .then(() => console.log('✅ MongoDB Atlas Connected Successfully → Database: BookCorner'))
  .catch(err => {
    console.error('❌ MongoDB Atlas Connection Failed');
    console.error('→ Check your MONGO_URI in .env file');
    console.error('→ Error:', err.message);
  });

module.exports = mongoose;