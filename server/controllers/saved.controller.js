import mongoose from 'mongoose';
import { SavedItem } from '../models/saved-item.model.js';
import { logActivity } from '../utils/activity-logger.js';

const ALLOWED_TYPES = ['CODE', 'DOCS', 'PHOTO', 'WHITEBOARD', 'PPT'];

export const saveItem = async (req, res) => {
  try {
    const { type, title, content, metadata } = req.body;
    const userId = req.user._id;

    if (!type || !ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ error: `Invalid type. Allowed types: ${ALLOWED_TYPES.join(', ')}` });
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: "Content is required" });
    }

    const newItem = await SavedItem.create({
      user: userId,
      type,
      title: title.trim().slice(0, 200),
      content,
      metadata: typeof metadata === 'object' && metadata !== null ? metadata : {},
    });

    await logActivity(
      userId,
      type,
      `Saved ${type.charAt(0) + type.slice(1).toLowerCase()}: ${title.trim().slice(0, 50)}`,
      "",
      `Item ID: ${newItem._id}`
    );

    return res.status(201).json({ message: "Item saved successfully", item: newItem });
  } catch (error) {
    console.error("Error saving item:", error);
    return res.status(500).json({ error: "Failed to save item" });
  }
};

export const getSavedItems = async (req, res) => {
  try {
    const userId = req.user._id;
    const items = await SavedItem.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(100);

    return res.status(200).json({ items });
  } catch (error) {
    console.error("Error fetching saved items:", error);
    return res.status(500).json({ error: "Failed to fetch saved items" });
  }
};

export const deleteSavedItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    const userId = req.user._id;
    const deleted = await SavedItem.findOneAndDelete({ _id: id, user: userId });

    if (!deleted) {
      return res.status(404).json({ error: "Item not found or unauthorized" });
    }

    return res.status(200).json({ message: "Item removed" });
  } catch (error) {
    console.error("Error deleting saved item:", error);
    return res.status(500).json({ error: "Failed to remove item" });
  }
};
