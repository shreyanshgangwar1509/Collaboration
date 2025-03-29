// import { QueryClient } from "@tanstack/react-query"; // Import QueryClientProvider
import React from "react";
import { Toaster } from "react-hot-toast";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "./Pages/Auth/Login";
import Profile from "./Pages/Auth/Profile";
import Register from "./Pages/Auth/Register";
import Chat from "./Pages/Chat/Chat";
import Chatbot from "./Pages/chatbot/Chatbot";
import CodingEditor from "./Pages/Coding/CodingEditor";
import CodingHome from "./Pages/Coding/CodingHome";
import DocEditor from "./Pages/Docs/DocEditor";
import Home from "./Pages/Home/Home";
import PPTEditor from "./Pages/PPT/PPTEditor";
import Editor from "./Pages/textEditor/Editor";
import Container from "./Pages/WhiteBoard/container/Container";
import WhiteHome from "./Pages/WhiteBoard/WhiteRoom";
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
            <Route path="/chat" element={
              <ChakraProvider>
                <Chat />
              </ChakraProvider>
            } />
            <Route path="/ppt" element={<PPTEditor />} />
            <Route path="/docs" element={<DocEditor />} />
            <Route path="/whiteboard" element={<WhiteHome/>} />
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
