import React from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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
import WhiteBoard from "./Pages/WhiteBoard/WhiteBoard";
import PhotoEditor from "./Pages/PhotoShop/PhotoEditor";
import Layout from "./layout/Layout";

const App = () => {
  return (
    <>
      <Toaster position="top-center" />
      <Router>
        <Routes>
          {/* Wrap routes inside Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/home/editor" element={<CodingHome />} />
            <Route path="/home/editor/:roomid" element={<CodingEditor />} />
            <Route
              path="/chat"
              element={
                <ChakraProvider>
                  <Chat />
                </ChakraProvider>
              }
            />
            <Route path="/ppt" element={<PPTEditor />} />
            <Route path="/docs" element={<DocEditor />} />
            <Route path="/whiteboard" element={<WhiteBoard />} />
            <Route path="/photoshop" element={<PhotoEditor />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
};

export default App;
