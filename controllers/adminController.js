const Admin = require('../models/admin');
const bcrypt = require('bcrypt');
const pool = require('../config/database');

const adminController = {
  loginPage: (req, res) => {
    res.render('admin/login');
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const admin = await Admin.findByEmail(email);
      
      if (!admin) {
        return res.render('admin/login', { error: 'Invalid email or password' });
      }

      const validPassword = await bcrypt.compare(password, admin.password);
      if (!validPassword) {
        return res.render('admin/login', { error: 'Invalid email or password' });
      }

      req.session.adminId = admin.id;
      res.redirect('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      res.render('admin/login', { error: 'An error occurred during login' });
    }
  },

  registerPage: (req, res) => {
    res.render('admin/register');
  },

  register: async (req, res) => {
    try {
      const { email, password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        return res.render('admin/register', { error: 'Passwords do not match' });
      }

      const existingAdmin = await Admin.findByEmail(email);
      if (existingAdmin) {
        return res.render('admin/register', { error: 'Email already registered' });
      }

      await Admin.create(email, password);
      res.redirect('/admin/login');
    } catch (error) {
      console.error('Registration error:', error);
      res.render('admin/register', { error: 'An error occurred during registration' });
    }
  },

  dashboard: async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session.adminId) {
        return res.redirect('/admin/login');
      }

      // Get admin statistics
      const [stats] = await pool.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as inactive
        FROM admins
      `);
      
      // Get all admin users
      const [users] = await pool.query('SELECT * FROM admins ORDER BY created_at DESC');
      
      // Initialize messages object
      const messages = {
        success: req.session.success || null,
        error: req.session.error || null
      };
      
      // Clear session messages
      delete req.session.success;
      delete req.session.error;
      
      res.render('admin/dashboard', {
        adminStats: stats[0],
        users: users,
        title: 'Admin Dashboard',
        messages: messages,
        currentSection: 'dashboard'
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.redirect('/admin/login');
    }
  },

  adminList: async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session.adminId) {
        return res.redirect('/admin/login');
      }

      // Get all admin users (excluding soft-deleted)
      const [users] = await pool.query('SELECT * FROM admins WHERE deleted_at IS NULL ORDER BY created_at DESC');
      
      // Initialize messages object
      const messages = {
        success: req.session.success || null,
        error: req.session.error || null
      };
      
      // Clear session messages
      delete req.session.success;
      delete req.session.error;
      
      res.render('admin/admin-list', {
        admins: users,
        title: 'Admin List',
        messages: messages,
        currentSection: 'admin-list'
      });
    } catch (error) {
      console.error('Admin list error:', error);
      res.redirect('/admin/login');
    }
  },

  logout: (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
  },

  showAddForm: (req, res) => {
    res.render('admin/add-admin', {
      title: 'Add New Admin',
      error: null,
      success: null,
      email: ''
    });
  },

  addAdmin: async (req, res) => {
    const { name, email, password, confirmPassword, status } = req.body;

    try {
      // Validate passwords match
      if (password !== confirmPassword) {
        req.session.error = 'Passwords do not match';
        return res.redirect('/admin/list');
      }

      // Convert email to lowercase
      const lowercaseEmail = email.toLowerCase();
      console.log('Attempting to add admin with email:', lowercaseEmail);

      // First, check if there's any record with this email (including soft-deleted)
      const [allRecords] = await pool.query(
        'SELECT id, email, deleted_at FROM admins WHERE email = ?',
        [lowercaseEmail]
      );
      console.log('All records with this email:', allRecords);

      // Then check specifically for non-deleted records
      const [existingAdmin] = await pool.query(
        'SELECT id, email, deleted_at FROM admins WHERE email = ? AND deleted_at IS NULL',
        [lowercaseEmail]
      );
      console.log('Active records with this email:', existingAdmin);

      if (existingAdmin.length > 0) {
        console.log('Found active admin with this email');
        req.session.error = 'Email already exists';
        return res.redirect('/admin/list');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed successfully');

      // If we have a soft-deleted record, update it instead of inserting
      if (allRecords.length > 0) {
        console.log('Found soft-deleted record, updating it');
        await pool.query(
          'UPDATE admins SET name = ?, password = ?, status = ?, deleted_at = NULL WHERE id = ?',
          [name, hashedPassword, status, allRecords[0].id]
        );
        console.log('Soft-deleted record updated successfully');
      } else {
        // Insert new admin with lowercase email
        await pool.query(
          'INSERT INTO admins (name, email, password, status, created_at) VALUES (?, ?, ?, ?, NOW())',
          [name, lowercaseEmail, hashedPassword, status]
        );
        console.log('New admin inserted successfully');
      }

      // Set success message in session
      req.session.success = 'Admin user created successfully!';
      res.redirect('/admin/list');
    } catch (error) {
      console.error('Add admin error details:', {
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
        sqlState: error.sqlState
      });
      req.session.error = 'An error occurred while creating the admin user: ' + error.message;
      res.redirect('/admin/list');
    }
  },

  getAdmin: async (req, res) => {
    try {
      const { id } = req.params;
      const [admin] = await pool.query('SELECT * FROM admins WHERE id = ?', [id]);
      
      if (admin.length === 0) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      
      res.json(admin[0]);
    } catch (error) {
      console.error('Get admin error:', error);
      res.status(500).json({ error: 'Failed to fetch admin data' });
    }
  },

  updateAdmin: async (req, res) => {
    try {
      const { id, name, email, status } = req.body;
      console.log('Admin update request:', { id, name, email, status });

      // Check if admin exists
      const [existingAdmin] = await pool.query('SELECT * FROM admins WHERE id = ? AND deleted_at IS NULL', [id]);
      if (!existingAdmin) {
        return res.status(404).json({ 
          success: false, 
          error: 'Admin not found' 
        });
      }

      // Check if email is being changed
      if (email !== existingAdmin.email) {
        // Check if new email already exists
        const [existingEmail] = await pool.query(
          'SELECT * FROM admins WHERE LOWER(email) = LOWER(?) AND id != ? AND deleted_at IS NULL',
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
        'UPDATE admins SET name = ?, email = LOWER(?), status = ?, updated_at = NOW() WHERE id = ?',
        [name, email, status, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Admin not found or no changes made' 
        });
      }

      console.log('Admin updated successfully');
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

  deleteAdmin: async (req, res) => {
    const { id } = req.params;
    console.log('Delete request received for admin ID:', id);
    console.log('Session adminId:', req.session.adminId);

    try {
      // Check if user is authenticated
      if (!req.session.adminId) {
        console.log('User not authenticated');
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      // Check if admin exists
      const [existingAdmin] = await pool.query('SELECT * FROM admins WHERE id = ?', [id]);
      if (existingAdmin.length === 0) {
        console.log('Admin not found');
        return res.status(404).json({ success: false, error: 'Admin not found' });
      }

      // Soft delete the admin by setting deleted_at timestamp
      await pool.query(
        'UPDATE admins SET deleted_at = NOW() WHERE id = ?',
        [id]
      );

      console.log('Admin soft deleted successfully');
      res.json({ success: true });
    } catch (error) {
      console.error('Delete admin error:', error);
      res.status(500).json({ success: false, error: 'Failed to delete admin' });
    }
  }
};

module.exports = adminController;
