// server.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const expressLayouts = require('express-ejs-layouts');

dotenv.config();
const app = express();

// Set views directory // Set up EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.use(expressLayouts);
// app.set('layout', 'admin/layout/admin-layout');


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


// Users Routes
const userRoutes = require('./routes/user');
app.use('/user', userRoutes);

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
});
