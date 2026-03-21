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

  static async findAllWithFilters({ 
    page = 1, 
    limit = 10, 
    role, 
    search, 
    startDate, 
    endDate, 
    sortBy = 'created_at', 
    order = 'DESC' 
  }) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (role) {
      whereClause += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }
    if (search) {
      whereClause += ` AND (username ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (startDate) {
      whereClause += ` AND created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      whereClause += ` AND created_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    // Count total
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Main query
    const query = `
      SELECT * FROM users 
      ${whereClause}
      ORDER BY ${sortBy} ${order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const users = result.rows.map(row => new User(row));

    return {
      users: users.map(u => u.toPublicJSON()),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // UPDATE USER (admin only)
  static async update(id, updateData) {
    const { username, email, role } = updateData;
    const result = await pool.query(
      `UPDATE users 
       SET username = COALESCE($1, username),
           email = COALESCE($2, email),
           role = COALESCE($3, role),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 
       RETURNING id, username, email, role, created_at`,
      [username, email, role, id]
    );
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  // DELETE USER (hard delete - use soft delete in production)
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0] ? true : false;
  }

  // GET STATS FOR ADMIN DASHBOARD
  static async getStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'customer' THEN 1 END) as customers,
        COUNT(CASE WHEN role = 'owner' THEN 1 END) as owners,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
      FROM users
    `);
    return result.rows[0];
  }
}

module.exports = UserRepository;