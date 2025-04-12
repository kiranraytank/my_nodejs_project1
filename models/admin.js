const pool = require('../config/database');
const bcrypt = require('bcrypt');

class Admin {
  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
    return rows[0];
  }

  static async create(email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO admins (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );
    return { id: result.insertId, email };
  }
}

module.exports = Admin;