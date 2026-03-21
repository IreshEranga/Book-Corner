const express = require('express');
const app = express();

app.use(express.json());

const booksRouter = require('./routes/books');
app.use('/books', booksRouter);

// Health check endpoint
app.get('/health', (req, res) => res.send('Book Service is running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Book Service running on port ${PORT}`));