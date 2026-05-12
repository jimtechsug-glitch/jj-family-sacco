import mongoose from 'mongoose';

const savingsSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  amount: { type: Number, required: true },
  transactionId: { type: String, default: '' },
  paymentMethod: { type: String, default: 'Cash' },
  status: { type: String, enum: ['Pending', 'Verified'], default: 'Pending' },
  date: { type: Date, default: Date.now }
});

export default mongoose.model('Savings', savingsSchema);
