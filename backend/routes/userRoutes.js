const express = require('express')
const userControllers = require('../controllers/userControllers')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/login', userControllers.loginUser)
router.route('/register').post(userControllers.registerUser)
router.get('/', protect, userControllers.getUsers)

module.exports = router