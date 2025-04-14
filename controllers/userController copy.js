const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.listUsers = async (req, res) => {
    // Initialize messages object
    const messages = {
        success: req.session.success || null,
        error: req.session.error || null
    };
    
    try {
        const users = await User.findAll();
        res.render('admin/user-list', {
            title: 'User Management',
            currentPage: 'users',
            messages: messages,
            admins: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.render('admin/user-list', {
            title: 'User Management',
            currentPage: 'users',
            admins: [],
            messages: messages,
            error: 'Error fetching users'
        });
    }
};

exports.addUser = async (req, res) => {
    try {
        const { name, email, password, type } = req.body;

        // Check if email already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.json({ success: false, message: 'Email already exists' });
        }

        // Create new user
        const newUser = await User.create({
            name,
            email,
            password,
            type
        });

        res.json({ success: true, message: 'User added successfully' });
    } catch (error) {
        console.error('Error adding user:', error);
        res.json({ success: false, message: 'Error adding user' });
    }
};

exports.editUser = async (req, res) => {
    try {
        const { userId, name, email, type } = req.body;

        // Check if email exists for other users
        const existingUser = await User.findByEmail(email);
        if (existingUser && existingUser.id !== parseInt(userId)) {
            return res.json({ success: false, message: 'Email already exists' });
        }

        // Update user
        const updated = await User.update(userId, {
            name,
            email,
            type
        });

        if (updated) {
            res.json({ success: true, message: 'User updated successfully' });
        } else {
            res.json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.json({ success: false, message: 'Error updating user' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const deleted = await User.delete(userId);
        
        if (deleted) {
            res.json({ success: true, message: 'User deleted successfully' });
        } else {
            res.json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.json({ success: false, message: 'Error deleting user' });
    }
};
