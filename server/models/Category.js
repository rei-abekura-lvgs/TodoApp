import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'カテゴリ名は必須です'],
    trim: true,
    unique: true
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
CategorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create index for better performance
CategorySchema.index({ name: 1 }, { unique: true });

export default mongoose.model('Category', CategorySchema);
