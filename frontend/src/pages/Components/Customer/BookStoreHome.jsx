import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { Search, BookOpen, ShoppingCart, Eye } from 'lucide-react';

const BOOK_API = import.meta.env.VITE_BOOK_API || 'http://localhost:3000/books';

function BookStoreHome() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
  try {
    setLoading(true);

    const response = await fetch(BOOK_API);
    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }

    const data = await response.json();
    setBooks(data);

    const uniqueCategories = [
      'All',
      ...new Set(data.map((book) => book.category).filter(Boolean)),
    ];

    setCategories(uniqueCategories);
  } catch (error) {
    console.error('Error fetching books:', error);
    Swal.fire({
      icon: 'error',
      title: 'Failed to load books',
      text: 'Please check whether the Book Service is running on port 3000.',
      background: '#1e2937',
      color: '#fff',
    });
  } finally {
    setLoading(false);
  }
};

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesCategory =
        selectedCategory === 'All' || book.category === selectedCategory;

      const term = searchTerm.toLowerCase();
      const matchesSearch =
        book.title?.toLowerCase().includes(term) ||
        book.author?.toLowerCase().includes(term) ||
        book.category?.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [books, selectedCategory, searchTerm]);

  const handleViewBook = (book) => {
    setSelectedBook(book);
  };

  const handleBuyNow = (book) => {
    navigate('/order', {
      state: {
        bookId: book.id,
        title: book.title,
        author: book.author,
        price: book.price,
        quantity: 1,
        imageUrl: book.imageUrl || book.image || '',
      },
    });
  };

  return (
    <div className="min-vh-100 bg-dark text-white">
      <div className="container py-4">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
          <div>
            <h2 className="fw-bold mb-1">Book Store</h2>
            <p className="text-white-50 mb-0">
              Browse all books from the Book Service
            </p>
          </div>

          <div className="d-flex gap-2">
            <button
              onClick={fetchBooks}
              className="btn btn-outline-light"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="card bg-black border-secondary mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-lg-8">
                <div className="input-group">
                  <span className="input-group-text bg-dark text-white border-secondary">
                    <Search size={18} />
                  </span>
                  <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary"
                    placeholder="Search by title, author, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-lg-4">
                <select
                  className="form-select bg-dark text-white border-secondary"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <BookOpen size={60} className="mb-3 text-secondary" />
            <h5>Loading books...</h5>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-5">
            <BookOpen size={60} className="mb-3 text-secondary" />
            <h5>No books found</h5>
            <p className="text-white-50">
              Check your Book Service data or filters.
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredBooks.map((book) => (
              <div className="col-sm-6 col-md-4 col-xl-3" key={book.id}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="card bg-black border-secondary h-100 shadow-sm"
                >
                  <img
                    src={
                      book.imageUrl ||
                      book.image ||
                      'https://via.placeholder.com/300x400?text=Book'
                    }
                    className="card-img-top"
                    alt={book.title}
                    style={{ height: '320px', objectFit: 'cover' }}
                  />

                  <div className="card-body d-flex flex-column">
                    <span className="badge bg-secondary mb-2 align-self-start">
                      {book.category || 'Uncategorized'}
                    </span>

                    <h5 className="card-title text-white">{book.title}</h5>
                    <p className="text-white-50 mb-2">by {book.author}</p>

                    <p className="fw-bold text-info mb-2">
                      ${Number(book.price || 0).toFixed(2)}
                    </p>

                    <p className="text-white-50 small mb-3">
                      Stock: {book.stock ?? 0}
                    </p>

                    <div className="mt-auto d-flex gap-2">
                      <button
                        className="btn btn-outline-light w-50 d-flex align-items-center justify-content-center gap-2"
                        onClick={() => handleViewBook(book)}
                      >
                        <Eye size={16} />
                        View
                      </button>

                      <button
                        className="btn btn-primary w-50 d-flex align-items-center justify-content-center gap-2"
                        onClick={() => handleBuyNow(book)}
                        disabled={(book.stock ?? 0) <= 0}
                      >
                        <ShoppingCart size={16} />
                        Buy Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedBook && (
        <div
          className="modal show d-block"
          style={{ background: 'rgba(0,0,0,0.8)' }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-dark text-white border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">{selectedBook.title}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedBook(null)}
                />
              </div>

              <div className="modal-body">
                <div className="row g-4">
                  <div className="col-md-4">
                    <img
                      src={
                        selectedBook.imageUrl ||
                        selectedBook.image ||
                        'https://via.placeholder.com/300x400?text=Book'
                      }
                      alt={selectedBook.title}
                      className="img-fluid rounded"
                    />
                  </div>

                  <div className="col-md-8">
                    <p><strong>Author:</strong> {selectedBook.author}</p>
                    <p><strong>Category:</strong> {selectedBook.category || 'N/A'}</p>
                    <p><strong>Price:</strong> ${Number(selectedBook.price || 0).toFixed(2)}</p>
                    <p><strong>Stock:</strong> {selectedBook.stock ?? 0}</p>
                    <p>
                      <strong>Description:</strong><br />
                      {selectedBook.description || 'No description available.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-secondary">
                <button
                  className="btn btn-outline-light"
                  onClick={() => setSelectedBook(null)}
                >
                  Close
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleBuyNow(selectedBook)}
                  disabled={(selectedBook.stock ?? 0) <= 0}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookStoreHome;