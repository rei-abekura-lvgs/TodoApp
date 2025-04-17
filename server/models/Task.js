import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'タスクのタイトルは必須です'],
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    enum: [1, 2, 3], // 1: high, 2: medium, 3: low
    default: 2
  },
  dueDate: {
    type: Date,
    required: false
  },
  category: {
    type: String,
    required: false,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
TaskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better performance
TaskSchema.index({ createdAt: -1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ category: 1 });
TaskSchema.index({ completed: 1 });

export default mongoose.model('Task', TaskSchema);
