import mongoose from 'mongoose';
import Group from '../models/group.model.js';

export const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const group = await Group.create({
      name: name.trim(),
      description: description?.trim() || '',
      admin: req.user._id,
      members: [req.user._id],
    });

    const populatedGroup = await Group.findById(group._id)
      .populate('admin', 'name email avatar')
      .populate('members', 'name email avatar');

    return res.status(201).json({ populateGroup: populatedGroup });
  } catch (error) {
    console.error('Error in createGroup:', error);
    return res.status(400).json({ error: error.message || 'Failed to create group' });
  }
};

export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('admin', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ updatedAt: -1 });

    return res.json(groups);
  } catch (error) {
    console.error('Error in getGroups:', error);
    return res.status(500).json({ message: 'Failed to fetch groups' });
  }
};

export const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    if (!mongoose.isValidObjectId(groupId)) {
      return res.status(400).json({ message: 'Invalid group ID' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const userIdStr = req.user._id.toString();
    const isMember = group.members.some((m) => m.toString() === userIdStr);
    if (isMember) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }

    group.members.push(req.user._id);
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate('admin', 'name email avatar')
      .populate('members', 'name email avatar');

    return res.status(200).json({ message: 'Joined group successfully', group: updatedGroup });
  } catch (error) {
    console.error('Error joining group:', error);
    return res.status(500).json({ message: 'Internal server error joining group' });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    if (!mongoose.isValidObjectId(groupId)) {
      return res.status(400).json({ message: 'Invalid group ID' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const userIdStr = req.user._id.toString();
    const isMember = group.members.some((m) => m.toString() === userIdStr);
    if (!isMember) {
      return res.status(400).json({ message: 'You are not a member of this group' });
    }

    if (group.admin.toString() === userIdStr) {
      if (group.members.length > 1) {
        return res.status(400).json({
          message: 'You are the admin of this group. Please transfer admin rights before leaving.',
        });
      }

      await group.deleteOne();
      return res.status(200).json({
        message: 'You were the only member. Group has been deleted.',
      });
    }

    group.members = group.members.filter((member) => member?.toString() !== userIdStr);
    await group.save();

    return res.status(200).json({
      message: 'You have left the group successfully',
      group,
    });
  } catch (error) {
    console.error('Error leaving group:', error);
    return res.status(500).json({ message: 'Internal server error leaving group' });
  }
};
