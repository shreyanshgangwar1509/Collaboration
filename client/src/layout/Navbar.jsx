import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-lg font-bold">Collaboration App</div>
        <ul className="flex space-x-4">
          <li>
            <Link to="/chat" className="hover:text-blue-400">Chat</Link>
          </li>
          <li>
            <Link to="/chatbot" className="hover:text-blue-400">Chatbot</Link>
          </li>
          <li>
            <Link to="/ppt" className="hover:text-blue-400">PPT</Link>
          </li>
          <li>
            <Link to="/docs" className="hover:text-blue-400">Docs</Link>
          </li>
          <li>
            <Link to="/whiteboard" className="hover:text-blue-400">Whiteboard</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;