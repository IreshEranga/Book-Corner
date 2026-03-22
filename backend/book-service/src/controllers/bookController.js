// Sample in-memory book data
let books = [
  { id: 1, title: "Clean Code", stock: 5 },
  { id: 2, title: "Node.js Design Patterns", stock: 3 },
];

// COLLAB-SAFE: Notification service integration config.
const NOTIFICATION_EVENTS_API =
  process.env.NOTIFICATION_EVENTS_API || "http://localhost:3004/api/events";

// COLLAB-SAFE: Shared auth token for service-to-service notification calls.
const buildServiceAuthHeader = () => {
  if (!process.env.NOTIFICATION_SERVICE_TOKEN) {
    return null;
  }

  return `Bearer ${process.env.NOTIFICATION_SERVICE_TOKEN}`;
};

// COLLAB-SAFE: Fire-and-forget event emit so book operations are never blocked.
const emitNotificationEvent = async (eventPayload) => {
  const authHeader = buildServiceAuthHeader();

  if (!authHeader) {
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    await fetch(NOTIFICATION_EVENTS_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        "x-correlation-id": `book-${Date.now()}`,
      },
      body: JSON.stringify(eventPayload),
      signal: controller.signal,
    });
  } catch (error) {
    console.warn("Notification emit failed:", error.message);
  } finally {
    clearTimeout(timeoutId);
  }
};

// Get all books
const getAllBooks = (req, res) => res.json(books);

// Get book by ID
const getBookById = (req, res) => {
  const book = books.find((b) => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json(book);
};

// Add new book
const addBook = (req, res) => {
  const { title, stock } = req.body;
  const id = books.length + 1;
  const newBook = { id, title, stock };
  books.push(newBook);

  // COLLAB-SAFE: Emit book created notification event.
  emitNotificationEvent({
    eventType: "BOOK_CREATED",
    userId: process.env.NOTIFICATION_TARGET_USER_ID || "system-admin",
    title: "New book added",
    message: `Book \"${newBook.title}\" was added to catalog.`,
    metadata: {
      bookId: newBook.id,
      stock: newBook.stock,
    },
    channels: ["in-app"],
  });

  res.status(201).json(newBook);
};

// Update book
const updateBook = (req, res) => {
  const book = books.find((b) => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ message: "Book not found" });

  const { title, stock } = req.body;
  if (title) book.title = title;
  if (stock !== undefined) book.stock = stock;

  // COLLAB-SAFE: Emit book updated notification event.
  emitNotificationEvent({
    eventType: "BOOK_UPDATED",
    userId: process.env.NOTIFICATION_TARGET_USER_ID || "system-admin",
    title: "Book updated",
    message: `Book \"${book.title}\" details were updated.`,
    metadata: {
      bookId: book.id,
      stock: book.stock,
    },
    channels: ["in-app"],
  });

  res.json(book);
};

// Delete book
const deleteBook = (req, res) => {
  books = books.filter((b) => b.id !== parseInt(req.params.id));
  res.json({ message: "Book deleted" });
};

module.exports = { getAllBooks, getBookById, addBook, updateBook, deleteBook };
