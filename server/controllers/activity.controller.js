import { Activity } from '../models/activity.model.js';

export const getUserActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const activities = await Activity.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(50);
    
    res.status(200).json({ activities });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch activity" });
  }
};

export const clearUserActivity = async (req, res) => {
    try {
      const userId = req.user._id;
      await Activity.deleteMany({ user: userId });
      res.status(200).json({ message: "Activity cleared" });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear activity" });
    }
};
