import express from 'express';
import Member from '../models/Member.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Special check for hardcoded admin if no DB admin exists yet
    if (username === 'admin' && password === 'Adallyn2290') {
      return res.json({
        user: { username: 'admin', role: 'Admin', id: 'admin' },
        token: Buffer.from(`admin:Adallyn2290`).toString('base64')
      });
    }

    // Check member credentials in MongoDB
    const member = await Member.findOne({ name: username }); // Simplified for demo
    if (member && member.password === password) {
      return res.json({
        user: {
          id: member._id,
          name: member.name,
          role: member.role,
          phoneNumber: member.phoneNumber
        },
        token: Buffer.from(`${member._id}:${member.password}`).toString('base64')
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

export default router;
