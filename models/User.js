const pool = require('../config/database');
const bcrypt = require('bcrypt');
const Role = require('./Role');


class User {
    static async findAll() {
        const [rows] = await pool.query(`
            SELECT u.*, r.name as role_name 
            FROM users u 
            LEFT JOIN roles r ON u.role_id = r.id 
            WHERE u.deleted_at IS NULL 
            ORDER BY u.created_at DESC`
        );
        return rows;
    }

    static async findByEmail(email) {
        const [rows] = await pool.query(`
            SELECT u.*, r.name as role_name 
            FROM users u 
            LEFT JOIN roles r ON u.role_id = r.id 
            WHERE u.email = ? AND u.deleted_at IS NULL`, 
            [email]
        );
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await pool.query(`
            SELECT u.*, r.name as role_name 
            FROM users u 
            LEFT JOIN roles r ON u.role_id = r.id 
            WHERE u.id = ? AND u.deleted_at IS NULL`, 
            [id]
        );
        return rows[0];
    }

    static async create(userData) {
        const { name, email, password, role_id } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, role_id, created_at) VALUES (?, ?, ?, ?, NOW())',
            [name, email, hashedPassword, role_id]
        );
        return { id: result.insertId, name, email, role_id };
    }

    static async update(id, userData) {
        const { name, email, role_id } = userData;
        const [result] = await pool.query(
            'UPDATE users SET name = ?, email = ?, role_id = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL',
            [name, email, role_id, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.query(
            'UPDATE users SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
            [id]
        );
        return result.affectedRows > 0;
    }
}

// User.belongsTo(Role, { foreignKey: 'role_id' }); // role_id is FK in users table

module.exports = User;