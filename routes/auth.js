const express = require('express');
const router = express.Router();
const { hashPassword, comparePassword } = require('../middleware/auth');

// Register page
router.get('/register', (req, res) => {
  res.render('auth/register');
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, confirmPassword, firstName, lastName, role } = req.body;

    if (!email || !password || !confirmPassword || !firstName || !lastName || !role) {
      return res.render('auth/register', { error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.render('auth/register', { error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.render('auth/register', { error: 'Password must be at least 6 characters' });
    }

    const existingUser = await req.db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.render('auth/register', { error: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);
    await req.db.run(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, firstName, lastName, role]
    );

    res.redirect('/login?success=Account created successfully');
  } catch (error) {
    console.error(error);
    res.render('auth/register', { error: 'Registration failed' });
  }
});

// Login page
router.get('/login', (req, res) => {
  res.render('auth/login', { success: req.query.success });
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render('auth/login', { error: 'Email and password are required' });
    }

    const user = await req.db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.render('auth/login', { error: 'Invalid email or password' });
    }

    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      return res.render('auth/login', { error: 'Invalid email or password' });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role
    };

    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.render('auth/login', { error: 'Login failed' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.redirect('/');
  });
});

module.exports = router;
