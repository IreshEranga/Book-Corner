// Sample in-memory book data
let books = [
  { id: 1, title: 'Clean Code', stock: 5 },
  { id: 2, title: 'Node.js Design Patterns', stock: 3 }
];

// Get all books
const getAllBooks = (req, res) => res.json(books);

// Get book by ID
const getBookById = (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book);
};

// Add new book
const addBook = (req, res) => {
  const { title, stock } = req.body;
  const id = books.length + 1;
  const newBook = { id, title, stock };
  books.push(newBook);
  res.status(201).json(newBook);
};

// Update book
const updateBook = (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ message: 'Book not found' });

  const { title, stock } = req.body;
  if (title) book.title = title;
  if (stock !== undefined) book.stock = stock;

  res.json(book);
};

// Delete book
const deleteBook = (req, res) => {
  books = books.filter(b => b.id !== parseInt(req.params.id));
  res.json({ message: 'Book deleted' });
};

module.exports = { getAllBooks, getBookById, addBook, updateBook, deleteBook };