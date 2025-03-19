import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import Message from '../models/ChatModel.js';

const messageRouter=express.Router();
messageRouter.use(isAuthenticated);
messageRouter.post('/',async(req,res)=>{
    try {
        const {content,groupId}=req.body;
        const message = await Message.create({
            sender:req.user,
            content,
            group:groupId,
        });
        const populatedMessage = await Message.findById(message._id).populate(
            "sender",
            "name email"
        );
        console.log(populatedMessage);
        
        res.json(populatedMessage);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
});

//get messages for a group
messageRouter.get('/:groupId', async (req, res) => {
    console.log('Message semand');
    try {
        const messages=await Message.find({group:req.params.groupId})
        .populate("sender", "name email")
        .sort({createdAt:-1});
        res.json(messages);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
});

export default messageRouter;