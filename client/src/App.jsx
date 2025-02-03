import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import Editor from "./components/textEditor/Editor";
function App() {
  return (
    <div className="w-full bg-white">
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/editor" element={<Editor />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;


// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { ChakraProvider } from "@chakra-ui/react";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Chat from "./pages/Chat";
// import PrivateRoute from "./components/PrivateRoute";
// import LandingPage from "./pages/LandingPage";

// function App() {
//   return (
//     <ChakraProvider>
//       <Router>
//         <Routes>
//           <Route path="/" element={<LandingPage />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route
//             path="/chat"
//             element={
//               <PrivateRoute>
//                 <Chat />
//               </PrivateRoute>
//             }
//           />
//         </Routes>
//       </Router>
//     </ChakraProvider>
//   );
// }

// export default App;

