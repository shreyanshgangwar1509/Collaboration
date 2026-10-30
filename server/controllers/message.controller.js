import mongoose from 'mongoose';
import Message from '../models/message.model.js';

export const createMessage = async (req, res) => {
  try {
    const { content, groupId } = req.body;

    if (!groupId || !mongoose.isValidObjectId(groupId)) {
      return res.status(400).json({ message: 'Valid groupId is required' });
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    if (content.length > 5000) {
      return res.status(400).json({ message: 'Message exceeds maximum length of 5000 characters' });
    }

    const message = await Message.create({
      sender: req.user._id,
      content: content.trim(),
      group: groupId,
    });

    const populatedMessage = await Message.findById(message._id).populate(
      'sender',
      'name email avatar'
    );

    return res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    return res.status(400).json({ message: 'Failed to create message' });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    if (!groupId || !mongoose.isValidObjectId(groupId)) {
      return res.status(400).json({ message: 'Valid groupId is required' });
    }

    const messages = await Message.find({ group: groupId })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: 1 })
      .limit(100);

    return res.json(messages);
  } catch (error) {
    console.error('Error fetching group messages:', error);
    return res.status(500).json({ message: 'Failed to fetch messages' });
  }
};
