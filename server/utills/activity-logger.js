import { Activity } from '../models/activity.model.js';

export const logActivity = async (userId, type, action, roomId = "", details = "") => {
  try {
    if (!userId) return;
    await Activity.create({
      user: userId,
      type,
      action,
      roomId,
      details
    });
  } catch (error) {
    console.error("Failed to log activity:", error.message);
  }
};
