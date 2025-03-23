import MonacoEditor from "@monaco-editor/react";
import React, { useEffect, useRef, useState } from "react";

function Editor({ socketRef, roomid, onCodeChange, language, passcode }) {
  const editorRef = useRef(null);
  const [code, setCode] = useState(passcode || ""); // Default to empty string

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // Listen for code changes from other users
    socket.on("editor_change", ({roomid,newCode}) => {
      setCode(newCode); 
    });

    return () => {
      socket.off("editor_change");
      
    };
  }, [socketRef]);

  // Handle Code Changes
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    
    if (onCodeChange) {
      onCodeChange(newCode);
    }

    // Emit event to other users
    if (socketRef.current) {
      socketRef.current.emit("editor_change", {roomid,code:newCode});
    }
  };

  return (
    <MonacoEditor
      height="500px"
      language={language || "javascript"} // Allow dynamic language selection
      value={code}
      onChange={handleCodeChange}
      theme="vs-dark"
    />
  );
}

export default Editor;
