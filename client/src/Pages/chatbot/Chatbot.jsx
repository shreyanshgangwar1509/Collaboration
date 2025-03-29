import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React, { useState } from "react";
import { FaRobot } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import "./Chatbot.css";
//Function to make the http request(useMutation);
const sendMessageAPI=async(message)=>{
    const res=await axios.post("http://localhost:3000/api/chatbot/ask",{message});
    return res.data;
}
const Chatbot=()=>{
    const [message,setMessage]=useState("");
    const [isTyping,setIsTyping]=useState(false);
    const [conversations,setConversations]=useState([{role:"assistant",content:"Hello! How can I assist you today?"},
    ]);
    const mutation=useMutation({
        mutationFn:sendMessageAPI,
        mutationKey:['chatbot'],
        onSuccess:(data)=>{
            setIsTyping(false);
            setConversations((prevConversation)=>[
                ...prevConversation,
                {role:"assistant", content:data.message},
            ]);
        },
    });

    //Handle Submit
    const handleSubmitMessage=()=>{
        const currentMessage=message.trim();
        if(!currentMessage){
            alert("please enter a message");
            return ;
        }
        setConversations((prevConversation)=>[
            ...prevConversation,
            {role:"user", content:currentMessage},
        ]);
        setIsTyping(true);
        mutation.mutate(currentMessage);
        setMessage("");
    }
    console.log(mutation);
    return (
        <>
          <div className="header">
            <h1 className="title">AI Chatbot</h1>
            <p className="description">Enter your message in the input below to chat with the AI</p>
            <div className="data-container">
                <div className="conversation">
                    {conversations.map((entry,index)=>(
                        <div className={`message ${entry.role}`} key={index}>
                            <strong>
                                {entry.role ==="user"?"You" :<FaRobot/>}
                            </strong>
                            {entry.content}
                        </div>
                    ))}
                    {isTyping &&(
                        <div className="message assistant">
                            <FaRobot/>
                            <strong>AI is Typing....</strong>
                        </div>
                    )}
                </div>
                <div className="input-area">
                    <input type="text"
                    placeholder="Enter message"
                    value={message}
                    onChange={(e)=>setMessage(e.target.value)}
                    onKeyPress={(e)=>e.key==="Enter" && handleSubmitMessage} 
                    />
                    <button onClick={handleSubmitMessage}>{mutation?.isPending ?'Loading':<IoSend/>}</button>
                </div>
            </div>
          </div>
        </>
    )
};

export default Chatbot;