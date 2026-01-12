const pool = require('../prisma');

const createTask = async (req, res) => {
  try {
    const { title, description, groupId, assignedTo } = req.body;
    const userId = req.userId;

    if (!title || !groupId) {
      return res.status(400).json({ error: 'Title and group ID are required' });
    }

    const groupResult = await pool.query(
      'SELECT "createdBy" FROM "Group" WHERE id = $1',
      [groupId]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (groupResult.rows[0].createdBy !== userId) {
      return res.status(403).json({ error: 'Only the group creator can create tasks' });
    }

    if (assignedTo) {
      const assignedCheck = await pool.query(
        'SELECT 1 FROM "GroupMember" WHERE "groupId" = $1 AND "userId" = $2',
        [groupId, assignedTo]
      );

      const isAssigningCreator = groupResult.rows[0].createdBy === assignedTo;

      if (assignedCheck.rows.length === 0 && !isAssigningCreator) {
        return res.status(400).json({ error: 'Assigned user is not a member or creator of this group' });
      }
    }

    const taskId = require('crypto').randomUUID();
    await pool.query(
      'INSERT INTO "Task" (id, title, description, status, "groupId", "assignedTo", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())',
      [taskId, title, description || null, 'PENDING', groupId, assignedTo || null]
    );

    const result = await pool.query(
      `SELECT t.*, json_build_object('id', u.id, 'name', u.name, 'email', u.email) as "assignedUser" 
       FROM "Task" t 
       LEFT JOIN "User" u ON t."assignedTo" = u.id 
       WHERE t.id = $1`,
      [taskId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getGroupTasks = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.userId;

    const groupResult = await pool.query(
      'SELECT "createdBy" FROM "Group" WHERE id = $1',
      [groupId]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (groupResult.rows[0].createdBy !== userId) {
      const isMember = await pool.query(
        'SELECT 1 FROM "GroupMember" WHERE "groupId" = $1 AND "userId" = $2',
        [groupId, userId]
      );

      if (isMember.rows.length === 0) {
        return res.status(403).json({ error: 'You are not a member of this group' });
      }
    }

    const result = await pool.query(
      `SELECT t.*, json_build_object('id', u.id, 'name', u.name, 'email', u.email) as "assignedUser" 
       FROM "Task" t 
       LEFT JOIN "User" u ON t."assignedTo" = u.id 
       WHERE t."groupId" = $1 
       ORDER BY t."createdAt" DESC`,
      [groupId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, assignedTo } = req.body;
    const userId = req.userId;

    const taskResult = await pool.query('SELECT * FROM "Task" WHERE id = $1', [taskId]);

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = taskResult.rows[0];

    const groupResult = await pool.query(
      'SELECT "createdBy" FROM "Group" WHERE id = $1',
      [task.groupId]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isCreator = groupResult.rows[0].createdBy === userId;

    if (!isCreator) {
      const isMember = await pool.query(
        'SELECT 1 FROM "GroupMember" WHERE "groupId" = $1 AND "userId" = $2',
        [task.groupId, userId]
      );

      if (isMember.rows.length === 0) {
        return res.status(403).json({ error: 'You are not a member of this group' });
      }

      const allowedStatusValues = ['PENDING', 'DONE'];
      if (status === undefined || !allowedStatusValues.includes(status)) {
        return res.status(403).json({ error: 'Members can only toggle status between PENDING and DONE' });
      }

      if (title !== undefined || description !== undefined || assignedTo !== undefined) {
        return res.status(403).json({ error: 'Only the group creator can edit title, description, or assignee' });
      }
    } else {
      if (status !== undefined) {
        const allowedStatusValues = ['PENDING', 'DONE'];
        if (!allowedStatusValues.includes(status)) {
          return res.status(400).json({ error: 'Invalid status. Use PENDING or DONE' });
        }
      }

      if (assignedTo !== undefined) {
        const assignedCheck = await pool.query(
          'SELECT 1 FROM "GroupMember" WHERE "groupId" = $1 AND "userId" = $2',
          [task.groupId, assignedTo]
        );

        const isAssigningCreator = groupResult.rows[0].createdBy === assignedTo;

        if (assignedCheck.rows.length === 0 && !isAssigningCreator) {
          return res.status(400).json({ error: 'Assigned user is not a member or creator of this group' });
        }
      }
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (assignedTo !== undefined) {
      updates.push(`"assignedTo" = $${paramCount++}`);
      values.push(assignedTo);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(taskId);
    const query = `UPDATE "Task" SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const updateResult = await pool.query(query, values);

    const result = await pool.query(
      `SELECT t.*, json_build_object('id', u.id, 'name', u.name, 'email', u.email) as "assignedUser" 
       FROM "Task" t 
       LEFT JOIN "User" u ON t."assignedTo" = u.id 
       WHERE t.id = $1`,
      [taskId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;

    const taskResult = await pool.query('SELECT * FROM "Task" WHERE id = $1', [taskId]);

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = taskResult.rows[0];

    const groupResult = await pool.query(
      'SELECT "createdBy" FROM "Group" WHERE id = $1',
      [task.groupId]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (groupResult.rows[0].createdBy !== userId) {
      return res.status(403).json({ error: 'Only the group creator can delete tasks' });
    }

    await pool.query('DELETE FROM "Task" WHERE id = $1', [taskId]);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createTask, getGroupTasks, updateTask, deleteTask };
