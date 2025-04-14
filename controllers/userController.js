const User = require('../models/user');
const bcrypt = require('bcrypt');
const pool = require('../config/database');

const userController = {

  userList: async (req, res) => {
    try {
     
      // Get all admin users (excluding soft-deleted)
      const [users] = await pool.query('SELECT * FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC');
      
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
        title: 'User List',
        messages: messages,
        currentSection: 'user-list'
      });
    } catch (error) {
      console.error('User list error:', error);
      res.redirect('/admin/login');
    }
  },


  showAddForm: (req, res) => {
    res.render('user/add-user', {
      title: 'Add New User',
      error: null,
      success: null,
      email: ''
    });
  },

  addUser: async (req, res) => {
    const { name, email, status } = req.body;

    try {
      
      // Convert email to lowercase
      const lowercaseEmail = email.toLowerCase();
      console.log('Attempting to add user with email:', lowercaseEmail);

      // First, check if there's any record with this email (including soft-deleted)
      const [allRecords] = await pool.query(
        'SELECT id, email, deleted_at FROM users WHERE email = ?',
        [lowercaseEmail]
      );
      console.log('All records with this email:', allRecords);

      // Then check specifically for non-deleted records
      const [existingUser] = await pool.query(
        'SELECT id, email, deleted_at FROM users WHERE email = ? AND deleted_at IS NULL',
        [lowercaseEmail]
      );

      console.log('Active records with this email:', existingUser);

      if (existingUser.length > 0) {
        console.log('Found active admin with this email');
        req.session.error = 'Email already exists';
        return res.redirect('/user/list');
      }


     
      // If we have a soft-deleted record, update it instead of inserting
      if (allRecords.length > 0) {
        console.log('Found soft-deleted record, updating it');
        await pool.query(
          'UPDATE users SET name = ?, status = ?, deleted_at = NULL WHERE id = ?',
          [name, status, allRecords[0].id]
        );
        console.log('Soft-deleted record updated successfully');
      } else {
        // Insert new admin with lowercase email
        await pool.query(
          'INSERT INTO users (name, email, status, created_at) VALUES (?, ?, ?, NOW())',
          [name, lowercaseEmail, status]
        );
        console.log('New admin inserted successfully');
      }

      // Set success message in session
      req.session.success = 'User user created successfully!';
      res.redirect('/user/list');

    } catch (error) {
      console.error('Add user error details:', {
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
        sqlState: error.sqlState
      });
      req.session.error = 'An error occurred while creating the user: ' + error.message;
      res.redirect('/user/list');
    }
  },

  getUser: async (req, res) => {
    try {
      const { id } = req.params;
      const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
      
      if (user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user[0]);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to fetch user data' });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { id, name, email, status } = req.body;
      console.log('User update request:', { id, name, email, status });

      // Check if user exists
      const [existingUser] = await pool.query('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL', [id]);
      if (!existingUser) {
        return res.status(404).json({ 
          success: false, 
          error: 'User not found' 
        });
      }

      // Check if email is being changed
      if (email !== existingUser.email) {
        // Check if new email already exists
        const [existingEmail] = await pool.query(
          'SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND id != ? AND deleted_at IS NULL',
          [email, id]
        );
        console.log('Checking for existing admin with email:', email, 'excluding id:', id);
        console.log('Existing admin check result:', existingEmail);

        if (existingEmail && existingEmail.length > 0) {
          return res.status(400).json({ 
            success: false, 
            errors: {
              email: 'Email already exists. Please use a different email address.'
            }
          });
        }
      }

      // Update admin
      const [result] = await pool.query(
        'UPDATE users SET name = ?, email = LOWER(?), status = ?, updated_at = NOW() WHERE id = ?',
        [name, email, status, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'User not found or no changes made' 
        });
      }

      console.log('User updated successfully');
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating admin:', error);
      res.status(500).json({ 
        success: false, 
        errors: {
          email: 'An error occurred while updating the admin. Please try again.'
        }
      });
    }
  },

  deleteUser: async (req, res) => {
    const { id } = req.params;
    console.log('Delete request received for admin ID:', id);
    console.log('Session userId:', req.session.userId);

    try {
      // Check if user is authenticated
      if (!req.session.userId) {
        console.log('User not authenticated');
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      // Check if admin exists
      const [existingUser] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
      if (existingUser.length === 0) {
        console.log('User not found');
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Soft delete the admin by setting deleted_at timestamp
      await pool.query(
        'UPDATE users SET deleted_at = NOW() WHERE id = ?',
        [id]
      );

      console.log('User soft deleted successfully');
      res.json({ success: true });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ success: false, error: 'Failed to delete user' });
    }
  },

  
  userList: async (req, res) => {
    try {
     
      // Get all user users (excluding soft-deleted)
      const [users] = await pool.query('SELECT * FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC');
      
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
