import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase, updateDatabase } from '../db/database.js';

const router = express.Router();

// Helper function to generate credentials
const generateCredentials = (name) => {
  const username = name.split(' ').join('').toLowerCase() + Math.floor(Math.random() * 1000);
  const password = Math.random().toString(36).slice(-8);
  return { username, password };
};

// GET /api/members - Get all members
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    res.json(db.members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/members - Add new member
router.post('/', async (req, res) => {
  try {
    const { name, role = 'Member' } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Member name required' });
    }

    const db = await getDatabase();
    const { username, password } = generateCredentials(name);

    const newMember = {
      id: uuidv4(),
      name,
      role,
      username,
      password,
      joinedAt: new Date().toISOString().split('T')[0]
    };

    db.members.push(newMember);
    await updateDatabase(db);

    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/members/:id - Get member by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const member = db.members.find(m => m.id === req.params.id);

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/members/:id - Update member
router.put('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const memberIndex = db.members.findIndex(m => m.id === req.params.id);

    if (memberIndex === -1) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const updated = { ...db.members[memberIndex], ...req.body, id: db.members[memberIndex].id };
    db.members[memberIndex] = updated;
    await updateDatabase(db);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/members/:id - Delete member
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDatabase();

    db.members = db.members.filter(m => m.id !== req.params.id);
    db.savings = db.savings.filter(s => s.memberId !== req.params.id);
    db.loans = db.loans.filter(l => l.memberId !== req.params.id);

    await updateDatabase(db);

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/airtel-money - Process Airtel Money payment
router.post('/airtel-money', async (req, res) => {
  try {
    const { memberId, amount } = req.body;

    if (!memberId || !amount) {
      return res.status(400).json({ error: 'Member ID and amount are required' });
    }

    const db = await getDatabase();
    const member = db.members.find(m => m.id === memberId);

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Simulate Airtel Money payment processing
    const paymentSuccess = true; // Replace with actual Airtel Money API integration

    if (!paymentSuccess) {
      return res.status(500).json({ error: 'Payment processing failed' });
    }

    // Add the payment to the member's savings
    db.savings.push({
      id: uuidv4(),
      memberId,
      amount,
      date: new Date().toISOString()
    });

    await updateDatabase(db);

    res.json({ message: 'Payment successful', memberId, amount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
