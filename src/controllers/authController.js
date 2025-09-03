const { Admin } = require('../models');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (!existingAdmin) return res.status(404).json({ message: 'Admin not found' });

    // bcrypt compare here
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
