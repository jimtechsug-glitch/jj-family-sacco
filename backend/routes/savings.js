import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase, updateDatabase } from '../db/database.js';

const router = express.Router();

// GET /api/savings - Get all savings records
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    res.json(db.savings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/savings/member/:memberId - Get savings for a specific member
router.get('/member/:memberId', async (req, res) => {
  try {
    const db = await getDatabase();
    const memberSavings = db.savings.filter(s => s.memberId === req.params.memberId);
    res.json(memberSavings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/savings - Add new savings record
router.post('/', async (req, res) => {
  try {
    const { memberId, amount } = req.body;

    if (!memberId || !amount) {
      return res.status(400).json({ error: 'Member ID and amount required' });
    }

    const db = await getDatabase();
    const member = db.members.find(m => m.id === memberId);

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const newSaving = {
      id: uuidv4(),
      memberId,
      amount: Number(amount),
      date: new Date().toISOString().split('T')[0]
    };

    db.savings.push(newSaving);
    await updateDatabase(db);

    res.status(201).json(newSaving);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/savings/stats/total - Get total savings
router.get('/stats/total', async (req, res) => {
  try {
    const db = await getDatabase();
    const total = db.savings.reduce((acc, s) => acc + Number(s.amount), 0);
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
