// class User {
//   constructor({ id, username, email, password_hash, role, created_at }) {
//     this.id = id;
//     this.username = username;
//     this.email = email;
//     this.password_hash = password_hash;   // only used internally
//     this.role = role;
//     this.created_at = created_at;
//   }

//   // Safe public view (never send password_hash to frontend/other services)
//   toPublicJSON() {
//     return {
//       id: this.id,
//       username: this.username,
//       email: this.email,
//       role: this.role,
//       created_at: this.created_at
//     };
//   }
// }

// module.exports = User;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password_hash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['customer', 'owner', 'admin'], 
    default: 'customer' 
  },
  created_at: { type: Date, default: Date.now }
});

// Safe public view (never expose password_hash)
userSchema.methods.toPublicJSON = function() {
  return {
    id: this._id.toString(),
    username: this.username,
    email: this.email,
    role: this.role,
    created_at: this.created_at
  };
};

const User = mongoose.model('User', userSchema);
module.exports = User;