import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Editor from "./component/Editor";

const CODE_SNIPPETS = {
  python3: `print("Hello, World!")`,
  java: `public class Main { public static void main(String[] args) { System.out.println("Hello, World!"); } }`,
  cpp: `#include <iostream>\nusing namespace std;\nint main() { cout << "Hello, World!"; return 0; }`,
  nodejs: `console.log("Hello, World!");`,
  c: `#include <stdio.h>\nint main() { printf("Hello, World!"); return 0; }`,
  rust: `fn main() { println!("Hello, World!"); }`,
};

function CodingEditor({ username, socketRef, roomid, seteditor }) {
  const [selectedLanguage, setSelectedLanguage] = useState("python3");
  const [code, setCode] = useState(CODE_SNIPPETS["python3"]);
  const [output, setOutput] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [isOutputVisible, setIsOutputVisible] = useState(false);
   const [connectedUsers, setConnectedUsers] = useState([]);
  const cursorRef = useRef(null); 
  

  useEffect(() => {
    if (!socketRef?.current || !roomid) return;
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit("join editor", roomid);

    socket.on("users in editor room", (users) => {
      setConnectedUsers(users);
    });

    socket.on("user joined", (user) => {
      setConnectedUsers((prev) => [...prev, user]);
    });

    socket.on("user left", (userId) => {
      setConnectedUsers((prev) => prev.filter((user) => user?._id !== userId));
    });
    socket.on("notification", (notification) => {
      toast.success(notification.message);
    });
    const moveCursor = (event) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${event.clientX + 10}px`;
        cursorRef.current.style.top = `${event.clientY + 10}px`;
      }
    };

    window.addEventListener("mousemove", moveCursor);

    return () => {
      socket.emit("leave_editor", roomid);
      socket.off("users in editor room");
      socket.off("user joined");
      socket.off("user left");
      socket.off("notification");
      window.removeEventListener("mousemove", moveCursor);
    };
  }, [socketRef, roomid]);

  // Close editor
  const closeditor = () => {
    seteditor(false);
    // socketRef.current.emit("user_left")
  };

  // Run code execution request
  const runCode = async () => {
    setIsCompiling(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER}/compile`, {
        code,
        language: selectedLanguage,
      });
      setOutput(response.data.output || "No output");
    } catch (error) {
      console.error("Compilation error:", error);
      setOutput(error.response?.data?.error || "Server error: Unable to compile code.");
    } finally {
      setIsCompiling(false);
    }
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);
    setCode(CODE_SNIPPETS[lang] || "");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-4 relative">
      

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
        <button onClick={closeditor} className="bg-red-500 hover:bg-red-400 px-4 py-2 rounded-md">
          Close Editor
        </button>
      </div>

      {/* Main Content - Editor & Output */}
      <div className="flex flex-grow">
        {/* Code Editor */}
        <div className="w-full md:w-2/3 p-2">
          <Editor
            passcode={code}
            roomid={roomid}
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
