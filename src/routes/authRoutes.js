const express = require('express');
const validateBody = require('../middleware/validateBody');
const { authSchema } = require('../utils/schemas');
const { register, login, refresh, logout } = require('../controllers/authController');
const router = express.Router();



router.post('/register',validateBody(authSchema),register);

router.post('/login',validateBody(authSchema),login)

router.post('/refresh',refresh)

router.post('/logout',logout)

module.exports = router;