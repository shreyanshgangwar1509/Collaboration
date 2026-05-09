import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['CODE', 'WHITEBOARD', 'DOCS', 'PPT', 'PHOTO', 'CHAT', 'CHATBOT'],
    required: true,
  },
  action: {
    type: String, // e.g., "Joined Room", "Saved Document", "Added Shape"
    required: true,
  },
  roomId: {
    type: String,
  },
  details: {
    type: String, // More info if needed
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const Activity = mongoose.model('Activity', activitySchema);
