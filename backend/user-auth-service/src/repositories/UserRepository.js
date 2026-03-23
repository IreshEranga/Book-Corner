// const pool = require('../config/db');
// const bcrypt = require('bcrypt');
// const User = require('../models/User');

// class UserRepository {
//   // CREATE
//   static async create({ username, email, password, role = 'customer' }) {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const result = await pool.query(
//       `INSERT INTO users (username, email, password_hash, role)
//        VALUES ($1, $2, $3, $4)
//        RETURNING id, username, email, password_hash, role, created_at`,
//       [username, email, hashedPassword, role]
//     );
//     return new User(result.rows[0]);
//   }

//   // FIND BY EMAIL
//   static async findByEmail(email) {
//     const result = await pool.query(
//       'SELECT * FROM users WHERE email = $1',
//       [email]
//     );
//     return result.rows[0] ? new User(result.rows[0]) : null;
//   }

//   // FIND BY ID
//   static async findById(id) {
//     const result = await pool.query(
//       'SELECT * FROM users WHERE id = $1',
//       [id]
//     );
//     return result.rows[0] ? new User(result.rows[0]) : null;
//   }

//   // GET PUBLIC USER (for other microservices)
//   static async getPublicUser(id) {
//     const result = await pool.query(
//       'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
//       [id]
//     );
//     return result.rows[0] ? new User(result.rows[0]) : null;
//   }

//   static async findAllWithFilters({ 
//     page = 1, 
//     limit = 10, 
//     role, 
//     search, 
//     startDate, 
//     endDate, 
//     sortBy = 'created_at', 
//     order = 'DESC' 
//   }) {
//     const offset = (page - 1) * limit;
//     let whereClause = 'WHERE 1=1';
//     const params = [];
//     let paramIndex = 1;

//     if (role) {
//       whereClause += ` AND role = $${paramIndex}`;
//       params.push(role);
//       paramIndex++;
//     }
//     if (search) {
//       whereClause += ` AND (username ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
//       params.push(`%${search}%`);
//       paramIndex++;
//     }
//     if (startDate) {
//       whereClause += ` AND created_at >= $${paramIndex}`;
//       params.push(startDate);
//       paramIndex++;
//     }
//     if (endDate) {
//       whereClause += ` AND created_at <= $${paramIndex}`;
//       params.push(endDate);
//       paramIndex++;
//     }

//     // Count total
//     const countResult = await pool.query(
//       `SELECT COUNT(*) FROM users ${whereClause}`,
//       params
//     );
//     const total = parseInt(countResult.rows[0].count);

//     // Main query
//     const query = `
//       SELECT * FROM users 
//       ${whereClause}
//       ORDER BY ${sortBy} ${order}
//       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
//     `;
//     params.push(limit, offset);

//     const result = await pool.query(query, params);
//     const users = result.rows.map(row => new User(row));

//     return {
//       users: users.map(u => u.toPublicJSON()),
//       pagination: {
//         page,
//         limit,
//         total,
//         totalPages: Math.ceil(total / limit)
//       }
//     };
//   }

//   // UPDATE USER (admin only)
//   static async update(id, updateData) {
//     const { username, email, role } = updateData;
//     const result = await pool.query(
//       `UPDATE users 
//        SET username = COALESCE($1, username),
//            email = COALESCE($2, email),
//            role = COALESCE($3, role),
//            updated_at = CURRENT_TIMESTAMP
//        WHERE id = $4 
//        RETURNING id, username, email, role, created_at`,
//       [username, email, role, id]
//     );
//     return result.rows[0] ? new User(result.rows[0]) : null;
//   }

//   // DELETE USER (hard delete - use soft delete in production)
//   static async delete(id) {
//     const result = await pool.query(
//       'DELETE FROM users WHERE id = $1 RETURNING id',
//       [id]
//     );
//     return result.rows[0] ? true : false;
//   }

//   // GET STATS FOR ADMIN DASHBOARD
//   static async getStats() {
//     const result = await pool.query(`
//       SELECT 
//         COUNT(*) as total_users,
//         COUNT(CASE WHEN role = 'customer' THEN 1 END) as customers,
//         COUNT(CASE WHEN role = 'owner' THEN 1 END) as owners,
//         COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
//       FROM users
//     `);
//     return result.rows[0];
//   }

//   static async getMonthlyNewUsers() {
//     const result = await pool.query(`
//       SELECT 
//         TO_CHAR(created_at, 'Mon') AS month,
//         COUNT(*) AS count
//       FROM users
//       WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
//       GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
//       ORDER BY DATE_TRUNC('month', created_at)
//     `);
//     return result.rows;
//   }
// }

// module.exports = UserRepository;

const User = require('../models/User');
const bcrypt = require('bcrypt');

class UserRepository {

  // ===================== REGISTER =====================
  static async create({ username, email, password, role = 'customer' }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password_hash: hashedPassword, role });
    await user.save();
    return user;
  }

  // ===================== LOGIN =====================
  static async findByEmail(email) {
    return await User.findOne({ email });
  }

  // ===================== GET BY ID =====================
  static async findById(id) {
    return await User.findById(id);
  }

  // ===================== PUBLIC USER (for other services) =====================
  static async getPublicUser(id) {
    const user = await User.findById(id);
    return user ? user.toPublicJSON() : null;
  }

  // ===================== ADMIN: GET ALL USERS + FILTER + PAGINATION =====================
  static async findAllWithFilters({ page = 1, limit = 10, role, search, sortBy = 'created_at', order = 'DESC' }) {
    const skip = (page - 1) * limit;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { username: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const sort = { [sortBy]: order === 'ASC' ? 1 : -1 };

    const [users, total] = await Promise.all([
      User.find(query).sort(sort).skip(skip).limit(limit),
      User.countDocuments(query)
    ]);

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

  // ===================== ADMIN: UPDATE USER =====================
  static async update(id, updateData) {
    const updated = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    return updated ? updated.toPublicJSON() : null;
  }

  // ===================== ADMIN: DELETE USER =====================
  static async delete(id) {
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }

  // ===================== ADMIN: STATS =====================
  static async getStats() {
    const result = await User.aggregate([
      {
        $group: {
          _id: null,
          total_users: { $sum: 1 },
          customers: { $sum: { $cond: [{ $eq: ['$role', 'customer'] }, 1, 0] } },
          owners:    { $sum: { $cond: [{ $eq: ['$role', 'owner'] }, 1, 0] } },
          admins:    { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } }
        }
      }
    ]);
    return result[0] || { total_users: 0, customers: 0, owners: 0, admins: 0 };
  }

  // ===================== ADMIN: MONTHLY NEW USERS (for Line Chart) =====================
  static async getMonthlyNewUsers() {
    const result = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%b", date: "$created_at" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    return result.map(item => ({ month: item._id, count: item.count }));
  }
}

module.exports = UserRepository;