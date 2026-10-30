import mongoose from 'mongoose';

const whiteboardSchema=new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
    },
    whiteboard: {
        type: String,
        required: true,
    },
    image:{
        type: String,
        required: true,
    },
},{
    timestamps:true,
});


const Whiteboard=mongoose.model("Whiteboard",whiteboardSchema);
export default  Whiteboard;
