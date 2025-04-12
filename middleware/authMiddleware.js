const isAuthenticated = (req, res, next) => {
    if (req.session.adminId) {
      next();
    } else {
      res.redirect('/admin/login');
    }
  };
  
  module.exports = { isAuthenticated };