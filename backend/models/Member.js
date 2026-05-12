import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  role: { type: String, enum: ['Admin', 'Member'], default: 'Member' },
  phoneNumber: { type: String, default: '' },
  joinedDate: { type: Date, default: Date.now },
  password: { type: String, default: '1234' } // Default password for members
});

export default mongoose.model('Member', memberSchema);
