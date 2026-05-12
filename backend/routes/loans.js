import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase, updateDatabase } from '../db/database.js';

const router = express.Router();

// GET /api/loans - Get all loans
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    res.json(db.loans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/loans/member/:memberId - Get loans for a specific member
router.get('/member/:memberId', async (req, res) => {
  try {
    const db = await getDatabase();
    const memberLoans = db.loans.filter(l => l.memberId === req.params.memberId);
    res.json(memberLoans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/loans - Create new loan
router.post('/', async (req, res) => {
  try {
    const { memberId, principal, interestRate, repaymentMonths } = req.body;

    if (!memberId || !principal || interestRate === undefined || !repaymentMonths) {
      return res.status(400).json({ error: 'Missing required loan fields' });
    }

    const db = await getDatabase();
    const member = db.members.find(m => m.id === memberId);

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Check if member has active loan
    const activeLoan = db.loans.find(l => l.memberId === memberId && l.status === 'Active');
    if (activeLoan) {
      return res.status(400).json({ error: 'Member already has an active loan' });
    }

    const newLoan = {
      id: uuidv4(),
      memberId,
      principal: Number(principal),
      interestRate: Number(interestRate),
      repaymentMonths: Number(repaymentMonths),
      amountPaid: 0,
      status: 'Active',
      dateIssued: new Date().toISOString().split('T')[0]
    };

    db.loans.push(newLoan);
    await updateDatabase(db);

    res.status(201).json(newLoan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/loans/:loanId/repayment - Record loan repayment
router.post('/:loanId/repayment', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Repayment amount required' });
    }

    const db = await getDatabase();
    const loan = db.loans.find(l => l.id === req.params.loanId);

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const newPaid = loan.amountPaid + Number(amount);
    const totalDue = loan.principal + (loan.principal * loan.interestRate / 100);

    loan.amountPaid = newPaid;
    loan.status = newPaid >= totalDue ? 'Cleared' : 'Active';

    await updateDatabase(db);

    res.json(loan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/loans/stats/total - Get total loans issued
router.get('/stats/total-issued', async (req, res) => {
  try {
    const db = await getDatabase();
    const total = db.loans.reduce((acc, l) => acc + Number(l.principal), 0);
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/loans/stats/repayments - Get total repayments
router.get('/stats/total-repayments', async (req, res) => {
  try {
    const db = await getDatabase();
    const total = db.loans.reduce((acc, l) => acc + Number(l.amountPaid), 0);
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
