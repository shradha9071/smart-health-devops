const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  tokenNumber: { type: String, required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  status: { 
    type: String, 
    enum: ['waiting', 'called', 'serving', 'completed', 'skipped', 'cancelled'],
    default: 'waiting'
  },
  priority: { type: Boolean, default: false },
  counter: String,
  calledAt: Date,
  skippedAt: Date,
  completedAt: Date,
  cancelledAt: Date
}, { timestamps: true });

// Index for better query performance
tokenSchema.index({ department: 1, createdAt: -1 });
tokenSchema.index({ patient: 1, department: 1, createdAt: -1 });
tokenSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Token', tokenSchema);
