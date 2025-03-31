// import React from "react";
// import { useNavigate } from "react-router-dom";

// function Home() {
//   const navigate = useNavigate();
//   const routehandler = (e) =>
//   {
//     navigate(e.target.)
//     }
//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 animate-gradient text-white">
//       {/* Hero Section */}
//       <div className="text-center mb-10">
//         <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
//           Let's Collaborate
//         </h1>
//         <p className="text-lg text-gray-300 mt-2">
//           Work together in real-time with powerful tools!
//         </p>
//         <button className="mt-4 px-6 py-3 bg-pink-600 text-white rounded-lg text-lg font-semibold transition transform hover:scale-105 hover:bg-pink-500">
//           Get Started
//         </button>
//       </div>

//       {/* Features Section */}
//       <div className="flex flex-wrap justify-center gap-6 max-w-4xl">
//         {features.map((feature, index) => (
//           <div
//             onClick={() => {
//               navigate(feature.path)
//             }}
//             key={index}
//             className="bg-white/10 backdrop-blur-md p-6 rounded-lg w-40 md:w-48 text-center transition transform hover:-translate-y-2 hover:shadow-lg hover:bg-white/20"
//           >
//             <div className="text-4xl">{feature.icon}</div>
//             <h3 className="text-lg font-semibold mt-2">{feature.title}</h3>
//             <p className="text-sm text-gray-300">{feature.description}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// // Feature Data
// const features = [
//   { title: "Chat", description: "Real-time messaging", icon: "💬" ,path:"/chat"},
//   { title: "Whiteboard", description: "Sketch ideas visually", icon: "📝",path:"/whiteboard" },
//   { title: "Docs", description: "Collaborate on documents", icon: "📄",path:"/docs" },
//   { title: "PPT", description: "Work on presentations", icon: "📊" ,path:"/ppt"},
//   { title: "Code Editor", description: "Write & share code", icon: "💻" ,path:"/code-editor"},
//   { title: "More Tools", description: "Enhance your workflow", icon: "🚀" ,path:"/more"},
// ];

// export default Home;

import React from "react";
import Footer from "../../layout/Footer";
import AiSection from "./AiSection.jsx";
import Bottom from "./Bottom.jsx";
import Features from "./Features.jsx";
import Hero from "./Hero.jsx";

const Home = () => {
  return (
    <>
      
      <Hero />
      <Features/>
      <AiSection/>
      <Bottom />
      <Footer />
    </>
  );
}

export default Home;
