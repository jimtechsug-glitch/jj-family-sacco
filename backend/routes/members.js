import express from 'express';
import Member from '../models/Member.js';
import Savings from '../models/Savings.js';
import Loan from '../models/Loan.js';

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
    const members = await Member.find();
    res.json(members.map(m => ({
      id: m._id,
      name: m.name,
      username: m.username,
      password: m.password,
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

    const { username, password } = generateCredentials(name);

    const newMember = new Member({
      name,
      username,
      password,
      role,
      phoneNumber
    });

    await newMember.save();

    res.status(201).json({
      id: newMember._id,
      name: newMember.name,
      username: newMember.username,
      password: newMember.password,
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
      { returnDocument: 'after' }
    );

    if (!updatedMember) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({
      id: updatedMember._id,
      name: updatedMember.name,
      username: updatedMember.username,
      password: updatedMember.password,
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
    const { memberId, amount, transactionId } = req.body;

    if (!memberId || !amount || !transactionId) {
      return res.status(400).json({ error: 'Member ID, amount, and Transaction ID are required' });
    }

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Add to savings with Pending status
    const newSaving = new Savings({
      memberId,
      amount,
      transactionId,
      paymentMethod: 'Airtel Money',
      status: 'Pending'
    });
    await newSaving.save();

    res.json({ 
      message: 'Payment details submitted successfully. Awaiting admin verification.', 
      memberId, 
      amount, 
      transactionId 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
