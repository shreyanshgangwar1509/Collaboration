/**
 * Rule-based AI Chatbot (No external API required)
 * Replace the `getBotResponse` function with your AI API call later.
 */

const knowledgeBase = [
  // Greetings
  { patterns: ["hello", "hi", "hey", "greetings", "howdy"], response: "👋 Hello! I'm CollabBot, your AI assistant. I can help you with coding questions, collaboration tips, and more. What's on your mind?" },
  { patterns: ["how are you", "how r u", "how do you do"], response: "I'm running great and ready to help! 🚀 What can I assist you with today?" },
  { patterns: ["good morning", "morning"], response: "Good morning! ☀️ Hope you have a productive day. How can I help?" },
  { patterns: ["good night", "goodnight"], response: "Good night! 🌙 Don't forget to commit your code before sleeping! 😄" },
  { patterns: ["bye", "goodbye", "see you", "later"], response: "Goodbye! 👋 Happy coding! Come back anytime you need help." },
  { patterns: ["thanks", "thank you", "thx", "ty"], response: "You're welcome! 😊 Let me know if you need anything else." },
  
  // About the app
  { patterns: ["what can you do", "help", "features", "what do you know"], response: "I can help you with:\n\n🔧 **Coding** — syntax, algorithms, debugging tips\n📝 **Documents** — Google Docs-like collaborative editing\n🎨 **Whiteboard** — real-time canvas collaboration\n📊 **Presentations** — slide creation\n💬 **Chat** — group messaging tips\n\nJust ask me anything!" },
  { patterns: ["what is this app", "about this", "collabspace"], response: "**CollabSpace** is a real-time collaboration platform where you can:\n- Edit code together with your team\n- Draw on a shared whiteboard\n- Create collaborative documents\n- Build presentations as a group\n- Chat in real-time\n\nAll features sync live across all connected users! 🔄" },

  // Coding help
  { patterns: ["javascript", "js"], response: "JavaScript is a versatile language! Here are some quick tips:\n\n```js\n// Use const/let instead of var\nconst arr = [1, 2, 3];\nconst doubled = arr.map(x => x * 2);\n\n// Async/Await\nasync function fetchData() {\n  const res = await fetch('/api/data');\n  return res.json();\n}\n```\n\nWhat specific JS topic do you need help with?" },
  { patterns: ["python"], response: "Python is great for quick scripting and AI! Quick tips:\n\n```python\n# List comprehension\nsquares = [x**2 for x in range(10)]\n\n# F-strings\nname = 'World'\nprint(f'Hello, {name}!')\n\n# Type hints\ndef greet(name: str) -> str:\n    return f'Hello, {name}'\n```\n\nWhat Python topic can I help with?" },
  { patterns: ["react"], response: "React is powerful for UI! Some key concepts:\n\n```jsx\n// Custom hook\nconst useCounter = () => {\n  const [count, setCount] = useState(0);\n  return { count, increment: () => setCount(c => c + 1) };\n};\n\n// useEffect cleanup\nuseEffect(() => {\n  const sub = subscribe();\n  return () => sub.unsubscribe(); // cleanup!\n}, []);\n```\n\nAsk me about hooks, state management, or component patterns!" },
  { patterns: ["nodejs", "node.js", "node"], response: "Node.js tips:\n\n```js\n// Express middleware\napp.use((req, res, next) => {\n  console.log(`${req.method} ${req.path}`);\n  next();\n});\n\n// Async error handling\napp.get('/data', async (req, res) => {\n  try {\n    const data = await getData();\n    res.json(data);\n  } catch (err) {\n    res.status(500).json({ error: err.message });\n  }\n});\n```" },
  { patterns: ["socket", "socket.io", "websocket", "real-time", "realtime"], response: "Real-time communication with Socket.IO:\n\n```js\n// Server\nio.on('connection', (socket) => {\n  socket.join('room-1');\n  socket.to('room-1').emit('user_joined', { name });\n  socket.on('message', (data) => {\n    io.in('room-1').emit('message', data); // broadcast to room\n  });\n});\n\n// Client\nconst socket = io(SERVER_URL, { auth: { token } });\nsocket.emit('message', { text: 'Hello' });\nsocket.on('message', (data) => console.log(data));\n```" },
  { patterns: ["mongodb", "mongo", "mongoose"], response: "MongoDB with Mongoose:\n\n```js\n// Schema\nconst userSchema = new Schema({\n  name: { type: String, required: true },\n  email: { type: String, unique: true },\n  createdAt: { type: Date, default: Date.now }\n});\n\n// Query\nconst users = await User\n  .find({ isVerified: true })\n  .select('-password')\n  .sort({ createdAt: -1 })\n  .limit(10);\n```" },
  { patterns: ["git", "github", "version control"], response: "Git essentials:\n\n```bash\n# Start feature\ngit checkout -b feature/my-feature\ngit add .\ngit commit -m 'feat: add cool feature'\ngit push origin feature/my-feature\n\n# Undo last commit (keep changes)\ngit reset --soft HEAD~1\n\n# Stash work in progress\ngit stash push -m 'wip: half done'\ngit stash pop\n```" },
  { patterns: ["css", "tailwind", "style", "design"], response: "CSS/Tailwind tips:\n\n```css\n/* Glassmorphism card */\n.glass-card {\n  background: rgba(255,255,255,0.05);\n  backdrop-filter: blur(16px);\n  border: 1px solid rgba(255,255,255,0.1);\n  border-radius: 16px;\n}\n\n/* Gradient text */\n.gradient-text {\n  background: linear-gradient(135deg, #7c3aed, #4f46e5);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n```\n\nFor Tailwind: `bg-violet-600 hover:bg-violet-500 transition-colors`" },
  
  // Algorithms
  { patterns: ["sort", "sorting", "algorithm"], response: "Common sorting algorithms:\n\n```js\n// Quick Sort O(n log n)\nfunction quickSort(arr) {\n  if (arr.length <= 1) return arr;\n  const pivot = arr[Math.floor(arr.length / 2)];\n  const left = arr.filter(x => x < pivot);\n  const mid = arr.filter(x => x === pivot);\n  const right = arr.filter(x => x > pivot);\n  return [...quickSort(left), ...mid, ...quickSort(right)];\n}\n\n// Built-in sort (use this in practice)\narr.sort((a, b) => a - b); // ascending numbers\n```" },
  { patterns: ["binary search", "search"], response: "Binary Search O(log n):\n\n```js\nfunction binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1; // not found\n}\n// Array must be sorted!\n```" },
  { patterns: ["recursion", "recursive"], response: "Recursion pattern:\n\n```js\n// Classic example: Fibonacci\nfunction fib(n, memo = {}) {\n  if (n <= 1) return n;\n  if (memo[n]) return memo[n];\n  memo[n] = fib(n-1, memo) + fib(n-2, memo);\n  return memo[n];\n}\n\n// Tree traversal\nfunction traverse(node) {\n  if (!node) return;\n  console.log(node.value);\n  traverse(node.left);\n  traverse(node.right);\n}\n```" },

  // Debugging
  { patterns: ["debug", "error", "bug", "fix"], response: "Debugging tips 🐛:\n\n1. **Read the error message** carefully — it usually tells you exactly what's wrong\n2. **Console.log** key variables to trace data flow\n3. **Binary search your bug** — comment out half the code and narrow it down\n4. **Check the network tab** in DevTools for API issues\n5. **Use breakpoints** in browser DevTools or VS Code debugger\n\nPaste your error message and I'll help diagnose it!" },
  
  // Best practices
  { patterns: ["best practice", "clean code", "tips"], response: "Clean code tips:\n\n✅ Use meaningful variable names (`userCount` not `n`)\n✅ Keep functions small — one job per function\n✅ DRY principle — Don't Repeat Yourself\n✅ Add comments for WHY, not WHAT\n✅ Use TypeScript for large projects\n✅ Write tests for critical logic\n✅ Handle errors gracefully\n✅ Use environment variables for secrets\n✅ Keep dependencies up to date" },

  // Collaboration
  { patterns: ["collaborate", "team", "work together", "pair programming"], response: "Collaboration tips with CollabSpace:\n\n🔧 **Code Editor** — Share your room ID with teammates to code together\n📝 **Docs** — Work on documents simultaneously like Google Docs\n🎨 **Whiteboard** — Draw diagrams and brainstorm together\n📊 **PPT** — Build presentations as a team\n💬 **Chat** — Create groups and discuss in real-time\n\nTip: Copy the Room ID and share it via the Chat feature!" },

  // Fallback
];

const getBotResponse = (message) => {
  const lower = message.toLowerCase().trim();
  
  for (const entry of knowledgeBase) {
    if (entry.patterns.some(p => lower.includes(p))) {
      return entry.response;
    }
  }

  // Default fallback
  const fallbacks = [
    `I'm not sure about "${message}", but I can help with coding (JavaScript, Python, React, Node.js), algorithms, debugging, and using CollabSpace features. Try asking something like:\n- "How do I use sockets?"\n- "Explain recursion"\n- "What is this app?"`,
    `Interesting question! I don't have specific knowledge about that yet. I'm best at helping with:\n🔧 JavaScript / Python / React\n🔁 Algorithms & Data Structures\n🐛 Debugging tips\n🚀 Collaboration features\n\nCould you rephrase or ask something related?`,
    `I'm still learning! For that topic, I'd recommend checking the official documentation. Meanwhile, I can help you with coding questions, debugging, or feature guidance. What would you like to know?`,
  ];

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};

const asking = async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    // Simulate a small delay for realism
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));
    
    const response = getBotResponse(message.trim());
    return res.status(200).json({ message: response });
  } catch (error) {
    console.error("Chatbot error:", error);
    return res.status(500).json({ message: "I'm having trouble responding right now. Please try again!" });
  }
};

export { asking };
