import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Button from '../../components/uicomponents/Button';

function WhiteBoard({socketRef,roomid,username}) {
  // const location = useLocation();
  // const { socketRef, username, roomid } = location.state || {}; // Ensure roomid is passed

  const canvasRef = useRef(null);
  const timeoutRef = useRef(null);
  const ctxRef = useRef(null);
  const [color, setColor] = useState("#0000ff");
  const [lineWidth, setLineWidth] = useState(5);
  const [history, setHistory] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);

  useEffect(() => {
    
    const socket = socketRef.current;

    socket.emit("join_whiteboard_room", roomid);

    socket.on("canvas-data", (data) => {
      if (!canvasRef.current) return;
      const image = new Image();
      const ctx = canvasRef.current.getContext("2d");

      image.onload = () => ctx.drawImage(image, 0, 0);
      image.src = data;
    });

    socket.on("users in whiteboard room", (users) => {
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

    return () => {
      socket.emit("leave_whiteboard_room", roomid);
      socket.off("canvas-data");
      socket.off("users in whiteboard room");
      socket.off("user joined");
      socket.off("user left");
      socket.off("notification");
    };
  }, [socketRef, roomid]);

  useEffect(() => {
    initializeCanvas();
  }, []);

  // for saving drawing
//   const saveDrawing = async () => {
//     try {
//       const token = localStorage.getItem('token');
//     const response = await axios.post(
//       "http://localhost:3000/api/whiteboard/save",
//       { image: history }, // Body payload
//       {
//         headers: { Authorization: `Bearer ${token}` }, 
//       }
//     );
//     console.log("Drawing saved successfully:", response.data);
//   } catch (error) {
//     console.error("Error saving drawing:", error);
//   }
// };


  function initializeCanvas() {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;

    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    let drawing = false;
    let mouse = { x: 0, y: 0 };
    let lastMouse = { x: 0, y: 0 };

    const onMouseMove = (e) => {
      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;

      mouse.x = e.offsetX;
      mouse.y = e.offsetY;
      if (drawing) draw();
    };

    const onMouseDown = () => {
      drawing = true;
      setHistory([...history, canvas.toDataURL()]); // Save history
    };

    const onMouseUp = () => {
      drawing = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit("canvas-data", canvas.toDataURL("image/png"));
        }
      }, 1000);
    };

    const draw = () => {
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(lastMouse.x, lastMouse.y);
      ctxRef.current.lineTo(mouse.x, mouse.y);
      ctxRef.current.strokeStyle = color;
      ctxRef.current.lineWidth = lineWidth;
      ctxRef.current.lineCap = "round";
      ctxRef.current.lineJoin = "round";
      ctxRef.current.stroke();
      ctxRef.current.closePath();
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);

    return () => {
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
    };
  }

  const clearCanvas = () => {
    if (!canvasRef.current || !ctxRef.current) return;
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    if (socketRef.current) {
      socketRef.current.emit("canvas-data", canvasRef.current.toDataURL("image/png"));
    }
  };

  const undoLast = () => {
    if (history.length === 0) return;
    const lastState = history.pop();
    setHistory([...history]);

    if (!canvasRef.current || !ctxRef.current) return;
    const ctx = ctxRef.current;

    const img = new Image();
    img.src = lastState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  return (
    <div className="w-full h-screen flex flex-col items-center">
      <div className="flex gap-4 p-4 bg-gray-900 text-white w-full justify-center">
        <label className="flex items-center gap-2">
          🎨 Color: 
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 cursor-pointer" />
        </label>
        <label className="flex items-center gap-2">
          🖋 Line Width: 
          <input type="range" min="1" max="20" value={lineWidth} onChange={(e) => setLineWidth(parseInt(e.target.value))} />
        </label>
        <Button onClick={clearCanvas} className="bg-red-500">🧹 Clear</Button>
        <Button onClick={undoLast} className="bg-blue-500">↩️ Undo</Button>
      </div>
      <div className="relative w-full h-full">
        <canvas ref={canvasRef} className="absolute w-full h-full border border-gray-500 bg-white"></canvas>
      </div>
    </div>
  );
}

export default WhiteBoard;
