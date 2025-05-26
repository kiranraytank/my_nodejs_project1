const pool = require('../config/database');

class Role {
    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM roles ORDER BY name');
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM roles WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByName(name) {
        const [rows] = await pool.query('SELECT * FROM roles WHERE name = ?', [name]);
        return rows[0];
    }
}

// Role.hasMany(User, { foreignKey: 'role_id' });


module.exports = Role; 