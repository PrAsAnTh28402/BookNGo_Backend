exports.isUser = (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: "Access denied: Users only" });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};
