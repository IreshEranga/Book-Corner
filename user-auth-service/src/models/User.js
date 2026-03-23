class User {
  constructor({ id, username, email, password_hash, role, created_at }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password_hash = password_hash;   // only used internally
    this.role = role;
    this.created_at = created_at;
  }

  // Safe public view (never send password_hash to frontend/other services)
  toPublicJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
      created_at: this.created_at
    };
  }
}

module.exports = User;