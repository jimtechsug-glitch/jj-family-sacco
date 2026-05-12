import express from 'express';
import { getDatabase, updateDatabase } from '../db/database.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const db = await getDatabase();

    // Check admin credentials
    if (username === 'admin' && password === db.adminPassword) {
      return res.json({
        user: { username: 'admin', role: 'Admin', id: 'admin' },
        token: Buffer.from(`admin:${db.adminPassword}`).toString('base64')
      });
    }

    // Check member credentials
    const member = db.members.find(m => m.username === username);
    if (member && member.password === password) {
      return res.json({
        user: { ...member, role: 'Member' },
        token: Buffer.from(`${member.id}:${member.password}`).toString('base64')
      });
    }

    res.status(401).json({ error: 'Invalid username or password' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// POST /api/auth/change-password
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    const db = await getDatabase();

    if (currentPassword !== db.adminPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    db.adminPassword = newPassword;
    await updateDatabase(db);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
