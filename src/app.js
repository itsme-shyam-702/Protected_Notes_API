const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const notesRoutes = require('./routes/notesRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Security headers ─────────────────────────────────────────────
// helmet() sets Content-Security-Policy, X-Frame-Options, HSTS, etc.
app.use(helmet());

// ── HTTP request logger ──────────────────────────────────────────
app.use(morgan('dev'));

// ── Body parsing ─────────────────────────────────────────────────
app.use(express.json());

// ── CORS ─────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true, // allow cookies/Authorization header cross-origin
}));

// ── NoSQL injection prevention ───────────────────────────────────
// Strips $ and . from req.body so { "email": { "$gt": "" } } can't sneak through
app.use(mongoSanitize());

// ── HTTP Parameter Pollution ─────────────────────────────────────
app.use(hpp());

// ── Auth-specific rate limiter (brute-force protection) ──────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 10,                   // 10 login/register attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many auth attempts — locked for 15 minutes.',
    });
  },
});

// ── Global rate limiter ──────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// ── Routes ───────────────────────────────────────────────────────
// Auth rate limiter applied specifically to auth endpoints
app.use('/auth', authLimiter, authRoutes);
app.use('/notes', notesRoutes);

// ── Global error handler — must be LAST ──────────────────────────
app.use(errorHandler);

module.exports = app;
