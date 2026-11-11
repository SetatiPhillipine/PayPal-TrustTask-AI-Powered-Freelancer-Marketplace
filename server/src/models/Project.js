import mongoose from 'mongoose';
const milestoneSchema = new mongoose.Schema({
  title: String,
  description: String,
  amount: { type: Number, min: 0 },
  dueInDays: Number,
  status: { type: String, enum: ['pending', 'in_progress', 'submitted', 'approved'], default: 'pending' },
});
const projectSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  title: { type: String, required: true },
  description: String,
  summary: String,
  deliverables: [String],
  milestones: [milestoneSchema],
  status: { type: String, enum: ['open', 'active', 'completed'], default: 'open' },
  payment: {
    status: { type: String, enum: ['unpaid', 'pending', 'paid'], default: 'unpaid' },
    orderId: String,
    captureId: String,
    amount: Number,
    currency: { type: String, default: 'USD' },
    paidAt: Date,
  },
}, { timestamps: true });
projectSchema.virtual('total').get(function () {
  return this.milestones.reduce((s, m) => s + (m.amount || 0), 0);
});
projectSchema.set('toJSON', { virtuals: true });
export default mongoose.model('Project', projectSchema);
