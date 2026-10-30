import mongoose from 'mongoose';

const savedItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['CODE', 'DOCS', 'PHOTO', 'WHITEBOARD', 'PPT'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String, // Store code text, doc HTML, or image DataURL
    required: true,
  },
  metadata: {
    language: String, // for CODE
    slides: Array,   // for PPT
    width: Number,
    height: Number
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const SavedItem = mongoose.model('SavedItem', savedItemSchema);
