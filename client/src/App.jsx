import { ChakraProvider } from "@chakra-ui/react";
import React, { Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

const Layout = lazy(() => import("./layout/Layout"));
const Header = lazy(() => import("./layout/Header"));  // ✅ Fixed lazy import
const Login = lazy(() => import("./Pages/Auth/Login"));
const Profile = lazy(() => import("./Pages/Auth/Profile"));
const Register = lazy(() => import("./Pages/Auth/Register"));
const Chat = lazy(() => import("./Pages/Chat/Chat"));
const Chatbot = lazy(() => import("./Pages/chatbot/Chatbot"));
const CodingEditor = lazy(() => import("./Pages/Coding/CodingEditor"));
const CodingHome = lazy(() => import("./Pages/Coding/CodingHome"));
const Editor = lazy(() => import("./Pages/Coding/component/Editor"));
const DocEditor = lazy(() => import("./Pages/Docs/DocEditor"));
const Home = lazy(() => import("./Pages/Home/Home"));
const PhotoEditor = lazy(() => import("./Pages/PhotoShop/PhotoEditor"));
const PPTEditor = lazy(() => import("./Pages/PPT/PPTEditor"));
const Container = lazy(() => import("./Pages/WhiteBoard/container/Container"));
const WhiteHome = lazy(() => import("./Pages/WhiteBoard/WhiteRoom"));

const App = () => {
  return (
    <>
      <Toaster position="top-center" />
      <Suspense fallback={<div>Loading Header...</div>}>
        <Header/>
      </Suspense>
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
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
        </Suspense>
      </Router>
    </>
  );
};

export default App;
