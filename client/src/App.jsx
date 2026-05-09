import React, { Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

const Layout     = lazy(() => import("./layout/Layout"));
const Login      = lazy(() => import("./Pages/Auth/Login"));
const Profile    = lazy(() => import("./Pages/Auth/Profile"));
const Register   = lazy(() => import("./Pages/Auth/Register"));
const Chat       = lazy(() => import("./Pages/Chat/Chat"));
const Chatbot    = lazy(() => import("./Pages/chatbot/Chatbot"));
const CodingEditor = lazy(() => import("./Pages/Coding/CodingEditor"));
const CodingHome = lazy(() => import("./Pages/Coding/CodingHome"));
const DocEditor  = lazy(() => import("./Pages/Docs/DocEditor"));
const Home       = lazy(() => import("./Pages/Home/Home"));
const PhotoEditor = lazy(() => import("./Pages/PhotoShop/PhotoEditor"));
const PPTEditor  = lazy(() => import("./Pages/PPT/PPTEditor"));
const WhiteHome  = lazy(() => import("./Pages/WhiteBoard/WhiteRoom"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      <p className="text-sm animate-pulse" style={{ color: "var(--text-secondary)" }}>Loading...</p>
    </div>
  </div>
);

const App = () => {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#14141f",
            color: "#f1f5f9",
            border: "1px solid rgba(124,58,237,0.3)",
            borderRadius: "12px",
            fontSize: "14px",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#14141f" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#14141f" },
          },
        }}
      />
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route element={<Layout />}>
              {/* Public routes */}
              <Route path="/"         element={<Home />} />
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes — require login */}
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/chat"    element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />

              <Route path="/home/editor"         element={<ProtectedRoute><CodingHome /></ProtectedRoute>} />
              <Route path="/home/editor/:roomid" element={<ProtectedRoute><CodingEditor /></ProtectedRoute>} />

              <Route path="/whiteboard"         element={<ProtectedRoute><WhiteHome /></ProtectedRoute>} />

              <Route path="/docs"     element={<ProtectedRoute><DocEditor /></ProtectedRoute>} />
              <Route path="/ppt"      element={<ProtectedRoute><PPTEditor /></ProtectedRoute>} />
              <Route path="/photoshop" element={<ProtectedRoute><PhotoEditor /></ProtectedRoute>} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </>
  );
};

export default App;