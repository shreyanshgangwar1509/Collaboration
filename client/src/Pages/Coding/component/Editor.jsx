import MonacoEditor from "@monaco-editor/react"; // Renamed to avoid conflicts
import React, { useEffect, useRef, useState } from "react";
import { ACTIONS } from "../../../constants/Events";

function CodeEditor({ socketRef, roomId, onCodeChange }) {
  const editorRef = useRef(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          setCode(code);
        }
      });
    }
    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
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
      socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code: newCode });
    }
  };

  return (
    <MonacoEditor
      height="500px"
      language="javascript"
      value={code}
      onChange={handleCodeChange}
      theme="vs-dark"
    />
  );
}

export default CodeEditor;
