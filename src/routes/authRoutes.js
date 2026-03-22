const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, getUsers, createStaff } = require('../controllers/authController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.get('/users', protect, getUsers);

// Ruta para que un Admin cree personal para su gimnasio
router.post('/staff', protect, authorize('admin'), createStaff);

module.exports = router;
