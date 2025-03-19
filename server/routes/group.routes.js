import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import Group from '../models/GroupModel.js';
const groupRouter = express.Router();

groupRouter.use(isAuthenticated);

groupRouter.post('/create',async(req,res)=>{
    // console.log(req.user);
    try{
        const {name,description}=req.body;
        const group= await Group.create({name:name,description:description,
        admin:req.user,
        members:[req.user],
        });
        const populateGroup=await Group.findById(group._id)
        .populate("admin",'username email')
        .populate("members","username email");
        res.status(201).json({populateGroup});

    }catch(error){
        res.status(400).json({error:error.message});
    }
})

//get all groups
groupRouter.get("/",async(req,res)=>{
    try {
        const groups=await Group.find()
        .populate("admin","username email")
        .populate("members","username email");
        res.json(groups);
    } catch (error) {
        res.status(400).json({message:error.message});
    }
});

//join group
groupRouter.post("/:groupId/join",async(req,res)=>{
    try {
        const group = await Group.findById(req.params.groupId);
        console.log(group);
    
        if (!group) {
          return res.status(404).json({ message: "Group not found" });
        }
        if (group.members.includes(req.user)) {
            return res.status(404).json({ message: "Already in group" });
          }
        // Add the authenticated user to the group members if not already added
        if (!group.members.includes(req.user)) {
          group.members.push(req.user);
          await group.save();
        }
    
        // Respond with the updated group details
        res.status(200).json({ message: "Joined group successfully", group });
      } catch (error) {
        console.error("Error joining group:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
      }
});


//leave group 
groupRouter.post('/:groupId/leave', async (req, res) => {
    try {
      const group = await Group.findById(req.params.groupId);
  
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
  
      // Check if the user is a member of the group
      if (!group.members.includes(req.user)) {
        return res.status(400).json({
          message: "You are not a member of this group",
        });
      }
  
      // If the user is the admin
      if (group.admin.toString() === req.user.toString()) {
        if (group.members.length > 1) {
          return res.status(400).json({
            message:
              "You are the admin of this group. Transfer admin rights to another member before leaving.",
          });
        } else {
          // Delete the group if the admin is the only member
          await group.deleteOne();
          return res.status(200).json({
            message: "You were the only member of the group. Group has been deleted.",
          });
        }
      }
  
      // Remove the user from the group's members
      group.members = group.members.filter(
        (member) => member?.toString() !== req.user?.toString()
      );
  
      await group.save();
  
      res.status(200).json({
        message: "You have left the group successfully",
        group,
      });
    } catch (error) {
      console.error("Error leaving group:", error);
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  });
  
export default groupRouter;