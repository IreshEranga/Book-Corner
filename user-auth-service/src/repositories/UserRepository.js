const pool = require('../config/db');
const bcrypt = require('bcrypt');
const User = require('../models/User');

class UserRepository {
  // CREATE
  static async create({ username, email, password, role = 'customer' }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, password_hash, role, created_at`,
      [username, email, hashedPassword, role]
    );
    return new User(result.rows[0]);
  }

  // FIND BY EMAIL
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  // FIND BY ID
  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  // GET PUBLIC USER (for other microservices)
  static async getPublicUser(id) {
    const result = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] ? new User(result.rows[0]) : null;
  }
}

module.exports = UserRepository;