import mongoose from 'mongoose';

const repaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const loanSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  principal: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  repaymentMonths: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Active', 'Paid', 'Rejected'], default: 'Pending' },
  reason: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  repayments: [repaymentSchema]
});

export default mongoose.model('Loan', loanSchema);
