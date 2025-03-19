// // import axios from "axios";
// // import React, { useRef, useState } from "react";
// // import { toast } from "react-hot-toast";
// // import { useLocation, useNavigate, useParams } from "react-router-dom";
// // import Editor from "./Editor";

// // const LANGUAGE_SNIPPETS = {
// //   python3: `print("Hello, World!")`,
// //   java: `public class Main { public static void main(String[] args) { System.out.println("Hello, World!"); } }`,
// //   cpp: `#include <iostream>\nusing namespace std;\nint main() { cout << "Hello, World!"; return 0; }`,
// //   nodejs: `console.log("Hello, World!");`,
// //   c: `#include <stdio.h>\nint main() { printf("Hello, World!"); return 0; }`,
// // };

// // function CodingEditor() {
// //   const [output, setOutput] = useState("");
// //   const [isCompiling, setIsCompiling] = useState(false);
// //   const [selectedLanguage, setSelectedLanguage] = useState("python3");
// //   const codeRef = useRef(LANGUAGE_SNIPPETS[selectedLanguage]);
// //   const secondaryCodeRef = useRef("");

// //   const location = useLocation();
// //   const navigate = useNavigate();
// //   const { roomId } = useParams();

// //   if (!location.state) {
// //     navigate('/');
// //   }
// //   const copyRoomId = async () => {
// //     try {
// //       await navigator.clipboard.writeText(roomId);
// //       toast.success("Room ID copied!");
// //     } catch (error) {
// //       toast.error("Failed to copy Room ID");
// //     }
// //   };

// //   const leaveRoom = () => navigate("/");

// //   const runCode = async () => {
// //     setIsCompiling(true);
// //     try {
// //       const response = await axios.post("http://localhost:5000/compile", {
// //         code: codeRef.current,
// //         language: selectedLanguage,
// //       });
// //       setOutput(response.data.output || "No output received.");
// //     } catch (error) {
// //       setOutput(error.response?.data?.error || "An error occurred.");
// //     } finally {
// //       setIsCompiling(false);
// //     }
// //   };

// //   const handleLanguageChange = (e) => {
// //     const newLang = e.target.value;
// //     setSelectedLanguage(newLang);
// //     codeRef.current = LANGUAGE_SNIPPETS[newLang] || "";
// //   };

// //   return (
// //     <div className="h-screen flex flex-col">
// //       {/* Sidebar */}
// //       <div className="flex h-full">
// //         <aside className="w-1/5 bg-gray-900 text-white flex flex-col items-center p-4">
// //           <img src="/images/codecast.png" alt="Logo" className="w-32 mb-4" />
// //           <hr className="border-gray-700 w-full my-2" />
// //           <button className="w-full py-2 mb-3 bg-green-600 hover:bg-green-700 rounded-md" onClick={copyRoomId}>
// //             📋 Copy Room ID
// //           </button>
// //           <button className="w-full py-2 mb-3 bg-red-600 hover:bg-red-700 rounded-md" onClick={leaveRoom}>
// //             🚪 Leave Room
// //           </button>
// //         </aside>

// //         {/* Main Editor Area */}
// //         <main className="w-4/5 flex flex-col">
// //           <div className="bg-gray-800 p-3 flex justify-between items-center">
// //             <h5 className="text-white">Coding Editor</h5>
// //             <select className="bg-gray-700 text-white px-2 py-1 rounded" value={selectedLanguage} onChange={handleLanguageChange}>
// //               {Object.keys(LANGUAGE_SNIPPETS).map((lang) => (
// //                 <option key={lang} value={lang}>
// //                   {lang.toUpperCase()}
// //                 </option>
// //               ))}
// //             </select>
// //           </div>

// //           {/* Editors Layout */}
// //           <div className="flex flex-1 gap-4 p-4 relative">
// //             {/* Main Editor */}
// //             <Editor
// //               className="w-2/3 h-full border border-gray-700 rounded-md bg-gray-900 text-white"
// //               onCodeChange={(code) => (codeRef.current = code)}
// //               initialCode={codeRef.current}
// //             />

// //             {/* Second Editor (Sticky on Small Screens) */}
// //             <Editor
// //               className="w-1/3 h-full border border-gray-700 rounded-md bg-gray-900 text-white secondary-editor"
// //               onCodeChange={(code) => (secondaryCodeRef.current = code)}
// //               initialCode={secondaryCodeRef.current}
// //             />
// //           </div>
// //         </main>
// //       </div>

// //       {/* Bottom Buttons */}
// //       <div className="fixed bottom-4 right-4 flex gap-4">
// //         <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md" onClick={runCode} disabled={isCompiling}>
// //           {isCompiling ? "🔄 Compiling..." : "▶ Run Code"}
// //         </button>
// //       </div>

// //       {/* Compiler Output */}
// //       <div className="bg-gray-800 text-white p-3 rounded-md mt-2">
// //         <h5>Compiler Output ({selectedLanguage.toUpperCase()})</h5>
// //         <pre className="bg-gray-700 p-3 rounded-md">{output || "Output will appear here after compilation"}</pre>
// //       </div>
// //     </div>
// //   );
// // }

// // export default CodingEditor;

// import axios from "axios";
// import React, { useEffect, useRef, useState } from "react";
// import io from "socket.io-client";
// import Client from "./component/Client";
// import MonacoEditor from "./component/Editor";
 
// const CODE_SNIPPETS = {
//   python3: `print("Hello, World!")`,
//   java: `public class Main { public static void main(String[] args) { System.out.println("Hello, World!"); } }`,
//   cpp: `#include <iostream>\nusing namespace std;\nint main() { cout << "Hello, World!"; return 0; }`,
//   nodejs: `console.log("Hello, World!");`,
//   c: `#include <stdio.h>\nint main() { printf("Hello, World!"); return 0; }`,
//   rust: `fn main() { println!("Hello, World!"); }`,
// };

// function CodingEditor({username}) {
//   const [selectedLanguage, setSelectedLanguage] = useState("python3");
//   const [code, setCode] = useState(CODE_SNIPPETS["python3"]);
//   const [output, setOutput] = useState("");
//   const [isCompiling, setIsCompiling] = useState(false);
//   const [isOutputVisible, setIsOutputVisible] = useState(false);
//   const [socket, setSocket] = useState(null);
//   const mouseRef = useRef(null);
//   const socketref = useRef(null);
  
//   useEffect(() => {
//   const token = localStorage.getItem("token");
//   const newsocket = io(import.meta.env.VITE_SERVER, {
//     auth: { token },
//   });
    
//     setSocket(newsocket);
//     const moveCursor = (event) => {
//       if (mouseRef.current) {
//         mouseRef.current.style.left = `${event.clientX + 10}px`;
//         mouseRef.current.style.top = `${event.clientY + 10}px`;
//       }
//     };

//     window.addEventListener("mousemove", moveCursor);
//   socketref.current = newsocket;
//     return () => {
//       newsocket.disconnect();
//      window.removeEventListener("mousemove", moveCursor);
//   } // Cleanup on unmount
// }, []);

    
//   // Handle running the code
//   const runCode = async () => {
    
//     setIsCompiling(true);
//     try {
//       const response = await axios.post("http://localhost:3000/compile", {
//         code,
//         language: selectedLanguage,
//       });
//       setOutput(response.data.output || "No output");
//     } catch (error) {
//       setOutput(error.response?.data?.error || "An error occurred");
//     } finally {
//       setIsCompiling(false);
//     }
//   };

  
//   const handleLanguageChange = (e) => {
//     const lang = e.target.value;
//     setSelectedLanguage(lang);
//     setCode(CODE_SNIPPETS[lang] || "");
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
//       {/* Top Bar */}
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-2xl font-bold text-blue-400">Collaborative Code Editor</h1>
//         <select
//           className="bg-gray-800 text-white px-4 py-2 rounded-md border border-gray-600"
//           value={selectedLanguage}
//           onChange={handleLanguageChange}
//         >
//           {Object.keys(CODE_SNIPPETS).map((lang) => (
//             <option key={lang} value={lang}>
//               {lang.toUpperCase()}
//             </option>
//           ))}
//         </select>
//       </div>
// <div
//         ref={mouseRef}
//         style={{
//           position: "absolute",
//           width: "20px",
//           height: "20px",
//           backgroundColor: "red",
//           borderRadius: "50%",
//           pointerEvents: "none", // Prevent interaction with the element
//           transform: "translate(-50%, -50%)",
//         }}
//       >
//         <Client username={username}/>
//       </div>
//       {/* Main Content - Editor & Output */}
//       <div className="flex flex-grow">
//         {/* Code Editor */}
//         <div className="w-full md:w-2/3 p-2">
//           <MonacoEditor
//             code={code}
//             onCodeChange={setCode}
//             language={selectedLanguage}
//             socketRef={socketref}
//           />
          
//         </div>

//         {/* Output Window - Responsive */}
//         <div className="w-full md:w-1/3 p-2">
//           <div
//             className={`bg-gray-800 p-4 rounded-md border border-gray-700 ${
//               isOutputVisible ? "block" : "hidden md:block"
//             } md:sticky md:top-4`}
//           >
//             <h2 className="text-lg font-semibold mb-2">Output ({selectedLanguage})</h2>
//             <pre className="bg-black p-3 rounded-md text-green-400 h-40 overflow-auto">
//               {output || "Run code to see output"}
//             </pre>
//             <button
//               onClick={runCode}
//               className="mt-3 w-full bg-green-600 hover:bg-green-500 px-4 py-2 rounded-md transition"
//               disabled={isCompiling}
//             >
//               {isCompiling ? "Compiling..." : "Run Code"}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Floating Output Toggle */}
//       <button
//         className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md md:hidden"
//         onClick={() => setIsOutputVisible(!isOutputVisible)}
//       >
//         {isOutputVisible ? "Hide Output" : "Show Output"}
//       </button>
//     </div>
//   );
// }

// export default CodingEditor;


import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Client from "./component/Client";
import MonacoEditor from "./component/Editor";

const CODE_SNIPPETS = {
  python3: `print("Hello, World!")`,
  java: `public class Main { public static void main(String[] args) { System.out.println("Hello, World!"); } }`,
  cpp: `#include <iostream>\nusing namespace std;\nint main() { cout << "Hello, World!"; return 0; }`,
  nodejs: `console.log("Hello, World!");`,
  c: `#include <stdio.h>\nint main() { printf("Hello, World!"); return 0; }`,
  rust: `fn main() { println!("Hello, World!"); }`,
};

function CodingEditor({ username }) {
  const [selectedLanguage, setSelectedLanguage] = useState("python3");
  const [code, setCode] = useState(CODE_SNIPPETS["python3"]);
  const [output, setOutput] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [isOutputVisible, setIsOutputVisible] = useState(false);
  
  const socketRef = useRef(null);
  const cursorRef = useRef(null); // Cursor reference

  useEffect(() => {
    const token = localStorage.getItem("token");
    const newSocket = io(import.meta.env.VITE_SERVER, {
      auth: { token },
    });

    socketRef.current = newSocket;

    const moveCursor = (event) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${event.clientX + 10}px`;
        cursorRef.current.style.top = `${event.clientY + 10}px`;
      }
    };

    window.addEventListener("mousemove", moveCursor);

    return () => {
      newSocket.disconnect();
      window.removeEventListener("mousemove", moveCursor);
    };
  }, []);

  // Handle running the code
  const runCode = async () => {
    setIsCompiling(true);
    try {
      const response = await axios.post("http://localhost:3000/compile", {
        code,
        language: selectedLanguage,
      });
      setOutput(response.data.output || "No output");
    } catch (error) {
      setOutput(error.response?.data?.error || "An error occurred");
    } finally {
      setIsCompiling(false);
    }
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);
    setCode(CODE_SNIPPETS[lang] || "");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-4 relative">
      {/* Cursor Indicator */}
      <div
        ref={cursorRef}
        className="absolute w-10 h-10 mt-7 bg-red-500 rounded-full pointer-events-none"
        style={{ transform: "translate(-50%, -50%)" }}
      ><Client username={username} /></div>

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-400">Collaborative Code Editor</h1>
        <select
          className="bg-gray-800 text-white px-4 py-2 rounded-md border border-gray-600"
          value={selectedLanguage}
          onChange={handleLanguageChange}
        >
          {Object.keys(CODE_SNIPPETS).map((lang) => (
            <option key={lang} value={lang}>
              {lang.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Client Component */}
      

      {/* Main Content - Editor & Output */}
      <div className="flex flex-grow">
        {/* Code Editor */}
        <div className="w-full md:w-2/3 p-2">
          <MonacoEditor
            code={code}
            onCodeChange={setCode}
            language={selectedLanguage}
            socketRef={socketRef}
          />
        </div>

        {/* Output Window */}
        <div className="w-full md:w-1/3 p-2">
          <div
            className={`bg-gray-800 p-4 rounded-md border border-gray-700 ${
              isOutputVisible ? "block" : "hidden md:block"
            } md:sticky md:top-4`}
          >
            <h2 className="text-lg font-semibold mb-2">Output ({selectedLanguage})</h2>
            <pre className="bg-black p-3 rounded-md text-green-400 h-40 overflow-auto">
              {output || "Run code to see output"}
            </pre>
            <button
              onClick={runCode}
              className="mt-3 w-full bg-green-600 hover:bg-green-500 px-4 py-2 rounded-md transition"
              disabled={isCompiling}
            >
              {isCompiling ? "Compiling..." : "Run Code"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Floating Output Toggle */}
      <button
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md md:hidden"
        onClick={() => setIsOutputVisible(!isOutputVisible)}
      >
        {isOutputVisible ? "Hide Output" : "Show Output"}
      </button>
    </div>
  );
}

export default CodingEditor;
