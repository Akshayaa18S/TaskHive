const express = require('express');
const { createGroup, getMyGroups, inviteToGroup, getAllUsers } = require('../controllers/groupController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createGroup);
router.get('/my', authMiddleware, getMyGroups);
router.get('/users', authMiddleware, getAllUsers);
router.post('/invite', authMiddleware, inviteToGroup);

module.exports = router;
