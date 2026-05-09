import { SavedItem } from '../models/savedItem.model.js';
import { logActivity } from '../utills/activity-logger.js';

export const saveItem = async (req, res) => {
  try {
    const { type, title, content, metadata } = req.body;
    const userId = req.user._id;

    if (!type || !title || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newItem = await SavedItem.create({
      user: userId,
      type,
      title,
      content,
      metadata
    });

    // Log this as activity too
    await logActivity(userId, type, `Saved ${type.charAt(0) + type.slice(1).toLowerCase()}: ${title}`, "", `Item ID: ${newItem._id}`);

    res.status(201).json({ message: "Item saved successfully", item: newItem });
  } catch (error) {
    res.status(500).json({ error: "Failed to save item" });
  }
};

export const getSavedItems = async (req, res) => {
  try {
    const userId = req.user._id;
    const items = await SavedItem.find({ user: userId }).sort({ timestamp: -1 });
    res.status(200).json({ items });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch saved items" });
  }
};

export const deleteSavedItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    await SavedItem.findOneAndDelete({ _id: id, user: userId });
    res.status(200).json({ message: "Item removed" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove item" });
  }
};
