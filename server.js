// server.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Set views directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Admin Routes
const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
    if (req.session && req.session.adminId) {
        res.redirect('/admin/dashboard');
    } else {
        res.redirect('/admin/login');
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Something broke!');
});

// Catch-all route for non-admin routes (only for GET requests)
app.get('*', (req, res) => {
    if (req.session && req.session.adminId) {
        res.redirect('/admin/dashboard');
    } else {
        res.redirect('/admin/login');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Available routes:');
    console.log('- GET / -> redirects to /admin/login or /admin/dashboard');
    console.log('- GET /admin/login -> login page');
    console.log('- POST /admin/login -> login handler');
    console.log('- GET /admin/dashboard -> dashboard (requires auth)');
    console.log('- GET /admin/list -> admin list (requires auth)');
    console.log('- GET /admin/add -> add admin form (requires auth)');
    console.log('- POST /admin/add -> add admin handler (requires auth)');
    console.log('- POST /admin/delete/:id -> delete admin (requires auth)');
    console.log('- GET /admin/logout -> logout handler');
});
