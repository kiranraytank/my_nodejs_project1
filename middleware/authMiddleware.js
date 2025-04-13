const isAuthenticated = (req, res, next) => {
    if (req.session.adminId) {
        next();
    } else {
        // Check if it's an API request (has Accept: application/json header)
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.status(401).json({ error: 'Not authenticated' });
        } else {
            res.redirect('/admin/login');
        }
    }
};

module.exports = { isAuthenticated };