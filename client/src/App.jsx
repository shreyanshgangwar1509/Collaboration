import React from "react";
import { Toaster } from "react-hot-toast";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Import QueryClientProvider

import Login from "./Pages/Auth/Login";
import Profile from "./Pages/Auth/Profile";
import Register from "./Pages/Auth/Register";
import Chat from "./Pages/Chat/Chat";
import CodingEditor from "./Pages/Coding/CodingEditor";
import CodingHome from "./Pages/Coding/CodingHome";
import DocEditor from "./Pages/Docs/DocEditor";
import Home from "./Pages/Home/Home";
import PPTEditor from "./Pages/PPT/PPTEditor";
import WhiteBoard from "./Pages/WhiteBoard/WhiteBoard";
import Chatbot from "./Pages/chatbot/Chatbot";
import Editor from "./Pages/textEditor/Editor"
// Create a QueryClient instance
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full bg-white">
        <Toaster position="top-center" />

        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/home/editor" element={<CodingHome />} />
            <Route path="home/editor/:roomid" element={<CodingEditor />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/ppt" element={<PPTEditor />} />
            <Route path="/docs" element={<DocEditor />} />
            <Route path="/whiteboard" element={<WhiteBoard />} />
            <Route path="/whiteboard/:roomid" element={<Container />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/editor" element={<Editor />} />
          </Routes>
        </Router>
      </div>
    </QueryClientProvider>
  );
}

export default App;
