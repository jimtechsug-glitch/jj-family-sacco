import express from 'express';
import Savings from '../models/Savings.js';
import Member from '../models/Member.js';

const router = express.Router();

// GET /api/savings - Get all savings records
router.get('/', async (req, res) => {
  try {
    const savings = await Savings.find();
    res.json(savings.map(s => ({
      id: s._id,
      memberId: s.memberId,
      amount: s.amount,
      date: s.date.toISOString().split('T')[0]
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/savings/member/:memberId - Get savings for a specific member
router.get('/member/:memberId', async (req, res) => {
  try {
    const savings = await Savings.find({ memberId: req.params.memberId });
    res.json(savings.map(s => ({
      id: s._id,
      memberId: s.memberId,
      amount: s.amount,
      date: s.date.toISOString().split('T')[0]
    })));
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

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const newSaving = new Savings({
      memberId,
      amount: Number(amount)
    });

    await newSaving.save();

    res.status(201).json({
      id: newSaving._id,
      memberId: newSaving.memberId,
      amount: newSaving.amount,
      date: newSaving.date.toISOString().split('T')[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/savings/stats/total - Get total savings
router.get('/stats/total', async (req, res) => {
  try {
    const result = await Savings.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const total = result.length > 0 ? result[0].total : 0;
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
