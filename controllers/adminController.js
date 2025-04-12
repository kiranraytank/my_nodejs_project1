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

      // Get total admin count
      const [stats] = await pool.query('SELECT COUNT(*) as total FROM admins');
      
      // Get all admin users
      const [users] = await pool.query('SELECT * FROM admins ORDER BY created_at DESC');
      
      // Get success message from session and clear it
      const success = req.session.success;
      if (req.session.success) {
        delete req.session.success;
      }
      
      res.render('admin/dashboard', {
        adminCount: stats[0].total,
        users: users,
        title: 'Admin Dashboard',
        success: success,
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
    const { email, password, confirmPassword } = req.body;

    try {
      // Validate passwords match
      if (password !== confirmPassword) {
        return res.render('admin/add-admin', {
          title: 'Add New Admin',
          error: 'Passwords do not match',
          success: null,
          email
        });
      }

      // Check if email already exists
      const [existingAdmin] = await pool.query(
        'SELECT * FROM admins WHERE email = ?',
        [email]
      );

      if (existingAdmin.length > 0) {
        return res.render('admin/add-admin', {
          title: 'Add New Admin',
          error: 'Email already exists',
          success: null,
          email
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new admin
      await pool.query(
        'INSERT INTO admins (email, password, created_at) VALUES (?, ?, NOW())',
        [email, hashedPassword]
      );

      // Redirect to admin list page with success message
      req.session.success = 'Admin user created successfully!';
      res.redirect('/admin/list');
    } catch (error) {
      console.error('Add admin error:', error);
      res.render('admin/add-admin', {
        title: 'Add New Admin',
        error: 'An error occurred while creating the admin user',
        success: null,
        email
      });
    }
  }
};

module.exports = adminController;
