import React from "react";
import { Toaster } from "react-hot-toast";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import { ChakraProvider } from "@chakra-ui/react";
import Layout from "./layout/Layout";
import Login from "./Pages/Auth/Login";
import Profile from "./Pages/Auth/Profile";
import Register from "./Pages/Auth/Register";
import Chat from "./Pages/Chat/Chat";
import Chatbot from "./Pages/chatbot/Chatbot";
import CodingEditor from "./Pages/Coding/CodingEditor";
import CodingHome from "./Pages/Coding/CodingHome";
import Editor from "./Pages/Coding/component/Editor";
import DocEditor from "./Pages/Docs/DocEditor";
import Home from "./Pages/Home/Home";
import PhotoEditor from "./Pages/PhotoShop/PhotoEditor";
import PPTEditor from "./Pages/PPT/PPTEditor";
import Container from "./Pages/WhiteBoard/container/Container";
import WhiteHome from "./Pages/WhiteBoard/WhiteRoom";
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
            <Route path="/whiteboard" element={<WhiteHome />} />
            <Route path="/whiteboard/:roomid" element={<Container />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/photoshop" element={<PhotoEditor />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
};

export default App;
