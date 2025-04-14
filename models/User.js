const pool = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM users WHERE role = "user" ORDER BY created_at DESC');
        return rows;
    }

    static async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(userData) {
        const { name, email, password, type } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, type, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, type, 'user']
        );
        return { id: result.insertId, name, email, type };
    }

    static async update(id, userData) {
        const { name, email, type } = userData;
        const [result] = await pool.query(
            'UPDATE users SET name = ?, email = ?, type = ? WHERE id = ?',
            [name, email, type, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = User;