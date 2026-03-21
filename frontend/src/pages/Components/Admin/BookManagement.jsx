import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { Plus, Pencil, Trash2, BookOpen, RefreshCw } from 'lucide-react';

const BOOK_API = import.meta.env.VITE_BOOK_API || 'http://localhost:3000/books';

const initialForm = {
  title: '',
  author: '',
  price: '',
  category: '',
  description: '',
  imageUrl: '',
  stock: '',
};

function BookManagement() {
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingBookId, setEditingBookId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const filteredBooks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return books;

    return books.filter((book) => {
      return (
        book.title?.toLowerCase().includes(term) ||
        book.author?.toLowerCase().includes(term) ||
        book.category?.toLowerCase().includes(term)
      );
    });
  }, [books, searchTerm]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(BOOK_API);

      if (!response.ok) {
        throw new Error(`Failed to fetch books: ${response.status}`);
      }

      const data = await response.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to load books',
        text: 'Check whether Book Service is running and CORS is enabled.',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingBookId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.author.trim()) return 'Author is required';
    if (!formData.category.trim()) return 'Category is required';
    if (formData.price === '' || Number(formData.price) < 0) return 'Valid price is required';
    if (formData.stock === '' || Number(formData.stock) < 0) return 'Valid stock is required';
    return null;
  };

  const buildPayload = () => ({
    title: formData.title.trim(),
    author: formData.author.trim(),
    price: Number(formData.price),
    category: formData.category.trim(),
    description: formData.description.trim(),
    imageUrl: formData.imageUrl.trim(),
    stock: Number(formData.stock),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errorMessage = validateForm();
    if (errorMessage) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid form',
        text: errorMessage,
      });
      return;
    }

    const payload = buildPayload();

    try {
      setSubmitting(true);

      const isEdit = Boolean(editingBookId);
      const url = isEdit ? `${BOOK_API}/${editingBookId}` : BOOK_API;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`${method} request failed with ${response.status}`);
      }

      await fetchBooks();
      resetForm();

      Swal.fire({
        icon: 'success',
        title: isEdit ? 'Book updated' : 'Book added',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Operation failed',
        text: 'Could not save book. Please check backend validation.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (book) => {
    setEditingBookId(book._id || book.id);
    setFormData({
      title: book.title || '',
      author: book.author || '',
      price: book.price ?? '',
      category: book.category || '',
      description: book.description || '',
      imageUrl: book.imageUrl || '',
      stock: book.stock ?? '',
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (book) => {
    const id = book._id || book.id;

    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete book?',
      text: `Are you sure you want to delete "${book.title}"?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${BOOK_API}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`DELETE failed with ${response.status}`);
      }

      await fetchBooks();

      if (editingBookId === id) {
        resetForm();
      }

      Swal.fire({
        icon: 'success',
        title: 'Book deleted',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Delete failed',
        text: 'Could not delete the selected book.',
      });
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Book Management</h2>
          <p className="text-muted mb-0">Manage books in the catalog</p>
        </div>

        <button className="btn btn-outline-dark d-flex align-items-center gap-2" onClick={fetchBooks}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center gap-2 mb-3">
            <Plus size={18} />
            <h5 className="mb-0">{editingBookId ? 'Update Book' : 'Add New Book'}</h5>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Author</label>
                <input
                  type="text"
                  name="author"
                  className="form-control"
                  value={formData.author}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Price</label>
                <input
                  type="number"
                  name="price"
                  className="form-control"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Stock</label>
                <input
                  type="number"
                  name="stock"
                  className="form-control"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="col-12">
                <label className="form-label">Image URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  className="form-control"
                  value={formData.imageUrl}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  rows="4"
                  className="form-control"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button
                type="submit"
                className="btn btn-dark"
                disabled={submitting}
              >
                {submitting
                  ? 'Saving...'
                  : editingBookId
                  ? 'Update Book'
                  : 'Add Book'}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={resetForm}
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
            <div className="d-flex align-items-center gap-2">
              <BookOpen size={18} />
              <h5 className="mb-0">All Books</h5>
            </div>

            <input
              type="text"
              className="form-control"
              style={{ maxWidth: '320px' }}
              placeholder="Search by title, author, category"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <p className="mb-0">Loading books...</p>
          ) : filteredBooks.length === 0 ? (
            <p className="mb-0">No books found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th style={{ minWidth: '160px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((book) => {
                    const id = book._id || book.id;

                    return (
                      <tr key={id}>
                        <td>
                          <img
                            src={book.imageUrl || 'https://via.placeholder.com/60x80?text=Book'}
                            alt={book.title}
                            style={{
                              width: '50px',
                              height: '70px',
                              objectFit: 'cover',
                              borderRadius: '6px',
                            }}
                          />
                        </td>
                        <td>{book.title}</td>
                        <td>{book.author}</td>
                        <td>{book.category}</td>
                        <td>${Number(book.price || 0).toFixed(2)}</td>
                        <td>{book.stock ?? 0}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                              onClick={() => handleEdit(book)}
                            >
                              <Pencil size={14} />
                              Edit
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                              onClick={() => handleDelete(book)}
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookManagement;