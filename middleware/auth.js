const bcryptjs = require('bcryptjs');

const authenticateUser = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).render('403');
    }
    next();
  };
};

const hashPassword = async (password) => {
  return await bcryptjs.hash(password, 10);
};

const comparePassword = async (password, hash) => {
  return await bcryptjs.compare(password, hash);
};

module.exports = {
  authenticateUser,
  authorizeRole,
  hashPassword,
  comparePassword
};
