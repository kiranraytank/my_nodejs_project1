const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const pool = require('../config/database');

const userController = {

  showAddForm: (req, res) => {
    res.render('user/add-user', {
      title: 'Add New User',
      error: null,
      success: null,
      email: ''
    });
  },
  

  addUser: async (req, res) => {
    const { name, email, role_id } = req.body;

    try {
      // Convert email to lowercase
      const lowercaseEmail = email.toLowerCase();
      console.log('Attempting to add user with email:', lowercaseEmail);

      // Check if email exists (including soft-deleted)
      const [existingUser] = await pool.query(
        'SELECT id, email, deleted_at FROM users WHERE email = ? AND deleted_at IS NULL',
        [lowercaseEmail]
      );

      if (existingUser.length > 0) {
        req.session.error = 'Email already exists';
        return res.redirect('/user/list');
      }

      // Hash the password before saving
      const randomPassword = crypto.randomBytes(4).toString('hex'); // 8 chars
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      // // Create user
      // await pool.query(
      //   'INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)',
      //   [name, lowercaseEmail, hashedPassword, role_id]
      // );

      
      // Create new user
      await User.create({
        name,
        email: lowercaseEmail,
        password: hashedPassword,
        role_id
      });

      req.session.success = 'User created successfully!';
      res.redirect('/user/list');
    } catch (error) {
      console.error('Add user error:', error);
      req.session.error = 'An error occurred while creating the user';
      res.redirect('/user/list');
    }
  },


  getUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to fetch user data' });
    }
  },


  updateUser: async (req, res) => {
    try {
      const { id, name, email, role_id, status } = req.body;
      console.log('Received data:', status);

      // Check if email exists for other users
      const [existingEmail] = await pool.query(
        'SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND id != ? AND deleted_at IS NULL',
        [email, id]
      );

      if (existingEmail && existingEmail.length > 0) {
        return res.status(400).json({ 
          success: false, 
          errors: {
            email: 'Email already exists'
          }
        });
      }

      // Update admin
      const [updated] = await pool.query(
        'UPDATE users SET name = ?, email = LOWER(?), role_id = ?, status = ?, updated_at = NOW() WHERE id = ?',
        [name, email, role_id, status, id]
      );

      if (!updated) {
        return res.status(404).json({ 
          success: false, 
          error: 'User not found or no changes made' 
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ 
        success: false, 
        error: 'An error occurred while updating the user'
      });
    }
  },


  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if user exists and delete
      const deleted = await User.delete(id);
      
      if (!deleted) {
        return res.status(404).json({ 
          success: false, 
          error: 'User not found' 
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete user' 
      });
    }
  },


  userList: async (req, res) => {
    try {
     
      // Get all user users (excluding soft-deleted)
      // const [users] = await pool.query('SELECT * FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC');
      const [users] = await pool.query(`SELECT 
                                          users.id, users.name, users.email, users.status, roles.name AS role_name 
                                        FROM 
                                          users 
                                        LEFT JOIN 
                                          roles ON users.role_id = roles.id`);
      const [roles] = await pool.query('SELECT * FROM roles');

      
      // Initialize messages object
      const messages = {
        success: req.session.success || null,
        error: req.session.error || null
      };
      
      // Clear session messages
      delete req.session.success;
      delete req.session.error;
      
      res.render('admin/user-list', {
        users: users,
        roles: roles,
        title: 'User List',
        messages: messages,
        currentSection: 'user-list'
      });
    } catch (error) {
      console.error('User list error:', error);
      res.redirect('/admin/login');
    }
  },

};


module.exports = userController;
