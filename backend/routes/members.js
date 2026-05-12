import express from 'express';
import Member from '../models/Member.js';
import Savings from '../models/Savings.js';
import Loan from '../models/Loan.js';

const router = express.Router();

// GET /api/members - Get all members
router.get('/', async (req, res) => {
  try {
    const members = await Member.find();
    res.json(members.map(m => ({
      id: m._id,
      name: m.name,
      role: m.role,
      phoneNumber: m.phoneNumber,
      joinedAt: m.joinedDate.toISOString().split('T')[0]
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/members - Add new member
router.post('/', async (req, res) => {
  try {
    const { name, role = 'Member', phoneNumber = '' } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Member name required' });
    }

    const newMember = new Member({
      name,
      role,
      phoneNumber,
      password: '1234' // Default password
    });

    await newMember.save();

    res.status(201).json({
      id: newMember._id,
      name: newMember.name,
      role: newMember.role,
      phoneNumber: newMember.phoneNumber,
      joinedAt: newMember.joinedDate.toISOString().split('T')[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/members/:id - Update member
router.put('/:id', async (req, res) => {
  try {
    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedMember) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({
      id: updatedMember._id,
      name: updatedMember.name,
      role: updatedMember.role,
      phoneNumber: updatedMember.phoneNumber,
      joinedAt: updatedMember.joinedDate.toISOString().split('T')[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/members/:id - Delete member
router.delete('/:id', async (req, res) => {
  try {
    const memberId = req.params.id;
    await Member.findByIdAndDelete(memberId);
    await Savings.deleteMany({ memberId });
    await Loan.deleteMany({ memberId });

    res.json({ message: 'Member and related data deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/members/airtel-money - Process Airtel Money payment
// Note: In App.jsx this was pointed to /api/members/airtel-money or /api/airtel-money
// I'll make it /api/members/airtel-money for consistency with the router use in server.js
router.post('/airtel-money', async (req, res) => {
  try {
    const { memberId, amount } = req.body;

    if (!memberId || !amount) {
      return res.status(400).json({ error: 'Member ID and amount are required' });
    }

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Add to savings
    const newSaving = new Savings({
      memberId,
      amount
    });
    await newSaving.save();

    res.json({ message: 'Payment successful', memberId, amount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
