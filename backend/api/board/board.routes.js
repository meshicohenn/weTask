const express = require('express')

const { requireAuth } = require('../../middlewares/requireAuth.middleware')

const { getBoard, getBoards, deleteBoard, updateBoard, addBoard } = require('./board.controller')
const router = express.Router()

// @SHAI: REMOVED THE requireAuth, need to set them!

router.get('/', getBoards)
router.get('/:id', getBoard)
router.post('/', addBoard)
router.put('/:id', updateBoard)
router.delete('/:id', requireAuth, deleteBoard)

module.exports = router