require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcryptjs = require('bcryptjs');
const path = require('path');
const Database = require('./config/database');
const { authenticateUser, authorizeRole } = require('./middleware/auth');
const routes = require('./routes');

const app = express();
const db = new Database();

// Initialize database
db.initialize();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Make db available to routes
app.use((req, res, next) => {
  req.db = db;
  res.locals.user = req.session?.user || null;
  next();
});

// Routes
app.use('/', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('500', { error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Classroom app running on http://localhost:${PORT}`);
});
