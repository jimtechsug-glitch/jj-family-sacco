import express from 'express';
import Loan from '../models/Loan.js';
import Member from '../models/Member.js';

const router = express.Router();

// GET /api/loans - Get all loans
router.get('/', async (req, res) => {
  try {
    const loans = await Loan.find();
    res.json(loans.map(l => ({
      id: l._id,
      memberId: l.memberId,
      principal: l.principal,
      interestRate: l.interestRate,
      repaymentMonths: l.repaymentMonths,
      amountPaid: l.repayments.reduce((acc, r) => acc + r.amount, 0),
      status: l.status,
      reason: l.reason || '',
      dateIssued: l.date.toISOString().split('T')[0]
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/loans/member/:memberId - Get loans for a specific member
router.get('/member/:memberId', async (req, res) => {
  try {
    const loans = await Loan.find({ memberId: req.params.memberId });
    res.json(loans.map(l => ({
      id: l._id,
      memberId: l.memberId,
      principal: l.principal,
      interestRate: l.interestRate,
      repaymentMonths: l.repaymentMonths,
      amountPaid: l.repayments.reduce((acc, r) => acc + r.amount, 0),
      status: l.status,
      reason: l.reason || '',
      dateIssued: l.date.toISOString().split('T')[0]
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/loans - Create new loan
router.post('/', async (req, res) => {
  try {
    const { memberId, principal, interestRate, repaymentMonths, reason = '', status = 'Active' } = req.body;

    if (!memberId || !principal || interestRate === undefined || !repaymentMonths) {
      return res.status(400).json({ error: 'Missing required loan fields' });
    }

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Check if member has active loan
    const activeLoan = await Loan.findOne({ memberId, status: 'Active' });
    if (activeLoan) {
      return res.status(400).json({ error: 'Member already has an active loan' });
    }

    const newLoan = new Loan({
      memberId,
      principal: Number(principal),
      interestRate: Number(interestRate),
      repaymentMonths: Number(repaymentMonths),
      reason,
      status
    });

    await newLoan.save();

    res.status(201).json({
      id: newLoan._id,
      memberId: newLoan.memberId,
      principal: newLoan.principal,
      interestRate: newLoan.interestRate,
      repaymentMonths: newLoan.repaymentMonths,
      amountPaid: 0,
      status: newLoan.status,
      reason: newLoan.reason || '',
      dateIssued: newLoan.date.toISOString().split('T')[0]
    });
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

    const loan = await Loan.findById(req.params.loanId);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    loan.repayments.push({ amount: Number(amount) });
    
    const amountPaid = loan.repayments.reduce((acc, r) => acc + r.amount, 0);
    const totalDue = loan.principal + (loan.principal * loan.interestRate / 100);

    if (amountPaid >= totalDue) {
      loan.status = 'Paid';
    }

    await loan.save();

    res.json({
      id: loan._id,
      memberId: loan.memberId,
      principal: loan.principal,
      interestRate: loan.interestRate,
      repaymentMonths: loan.repaymentMonths,
      amountPaid: amountPaid,
      status: loan.status,
      dateIssued: loan.date.toISOString().split('T')[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/loans/stats/total-issued - Get total loans issued
router.get('/stats/total-issued', async (req, res) => {
  try {
    const result = await Loan.aggregate([
      { $group: { _id: null, total: { $sum: "$principal" } } }
    ]);
    const total = result.length > 0 ? result[0].total : 0;
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/loans/stats/total-repayments - Get total repayments
router.get('/stats/total-repayments', async (req, res) => {
  try {
    const result = await Loan.aggregate([
      { $unwind: "$repayments" },
      { $group: { _id: null, total: { $sum: "$repayments.amount" } } }
    ]);
    const total = result.length > 0 ? result[0].total : 0;
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/loans/:id/approve - Approve a loan
router.patch('/:id/approve', async (req, res) => {
  try {
    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      { status: 'Active', date: new Date() }, // Reset date to approval date
      { returnDocument: 'after' }
    );
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    res.json(loan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/loans/:id/reject - Reject a loan
router.patch('/:id/reject', async (req, res) => {
  try {
    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      { status: 'Rejected' },
      { returnDocument: 'after' }
    );
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    res.json(loan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
