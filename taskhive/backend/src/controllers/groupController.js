const pool = require('../db');

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email FROM "User" ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.userId;

    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const groupId = require('crypto').randomUUID();

    await pool.query(
      'INSERT INTO "Group" (id, name, "createdBy", "createdAt") VALUES ($1, $2, $3, NOW())',
      [groupId, name, userId]
    );

    // Return creator info and empty members list (creator is not auto-added as member)
    const groupResult = await pool.query(
      `SELECT 
         g.id,
         g.name,
         g."createdAt",
         json_build_object('id', uc.id, 'name', uc.name, 'email', uc.email) AS creator,
         '[]'::json AS members
       FROM "Group" g
       JOIN "User" uc ON uc.id = g."createdBy"
       WHERE g.id = $1`,
      [groupId]
    );

    res.status(201).json(groupResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getMyGroups = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT 
         g.id,
         g.name,
         g."createdAt",
         json_build_object('id', uc.id, 'name', uc.name, 'email', uc.email) AS creator,
         COALESCE(
           (
             SELECT json_agg(
               json_build_object('id', gm.id, 'user', json_build_object('id', u.id, 'name', u.name, 'email', u.email))
             )
             FROM "GroupMember" gm
             JOIN "User" u ON gm."userId" = u.id
             WHERE gm."groupId" = g.id
           ), '[]'::json
         ) AS members
       FROM "Group" g
       JOIN "User" uc ON uc.id = g."createdBy"
       WHERE g."createdBy" = $1
          OR g.id IN (SELECT "groupId" FROM "GroupMember" WHERE "userId" = $1)
       ORDER BY g."createdAt" DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const inviteToGroup = async (req, res) => {
  try {
    const { groupId, userIdOrEmail } = req.body;
    const requesterId = req.userId;

    if (!groupId || !userIdOrEmail) {
      return res.status(400).json({ error: 'Group ID and user ID/email are required' });
    }

    // Check if group exists and requester is the creator
    const groupResult = await pool.query(
      'SELECT "createdBy" FROM "Group" WHERE id = $1',
      [groupId]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const group = groupResult.rows[0];

    if (group.createdBy !== requesterId) {
      return res.status(403).json({ error: 'Only the group creator can invite members' });
    }

    // Find user to invite
    let userToAdd;
    if (userIdOrEmail.includes('@')) {
      const result = await pool.query(
        'SELECT id, name, email FROM "User" WHERE LOWER(email) = LOWER($1)',
        [userIdOrEmail.trim()]
      );
      userToAdd = result.rows[0];
    } else {
      const result = await pool.query(
        'SELECT id, name, email FROM "User" WHERE id = $1',
        [userIdOrEmail.trim()]
      );
      userToAdd = result.rows[0];
    }

    if (!userToAdd) {
      return res.status(404).json({ 
        error: 'User not found',
        searchedFor: userIdOrEmail 
      });
    }

    // Check if already a member
    const existingMember = await pool.query(
      'SELECT * FROM "GroupMember" WHERE "groupId" = $1 AND "userId" = $2',
      [groupId, userToAdd.id]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({ error: 'User is already a member of this group' });
    }

    // Add user to group
    const memberId = require('crypto').randomUUID();
    await pool.query(
      'INSERT INTO "GroupMember" (id, "userId", "groupId") VALUES ($1, $2, $3)',
      [memberId, userToAdd.id, groupId]
    );

    res.status(201).json({
      id: memberId,
      user: {
        id: userToAdd.id,
        name: userToAdd.name,
        email: userToAdd.email
      }
    });
  } catch (error) {
    console.error('Error inviting user:', error);
    res.status(500).json({ error: 'Server error while inviting user' });
  }
};

module.exports = { createGroup, getMyGroups, inviteToGroup, getAllUsers };
