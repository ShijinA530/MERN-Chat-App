const express = require('express')
const { protect } = require('../middleware/authMiddleware')
const router = express.Router()
const { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup, deleteChat } = require('../controllers/chatControllers')

router.post('/', protect, accessChat)
router.get('/', protect, fetchChats)
router.post('/group', protect, createGroupChat)
router.put('/rename', protect, renameGroup)
router.put('/groupadd', protect, addToGroup)
router.put('/groupremove', protect, removeFromGroup)

//router.get('/:id', deleteChat)

module.exports = router