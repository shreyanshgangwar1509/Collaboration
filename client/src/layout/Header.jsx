import { Menu, X } from "lucide-react"; // optional: for hamburger icons
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { navigation } from "../constants/constants.js";

const Header = () => {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-n-8/90 backdrop-blur-sm border-b border-n-6">
      <div className="flex justify-between items-center px-6 py-3 lg:px-8">
        {/* Hamburger icon for mobile */}
        <div className="lg:hidden">
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="text-white focus:outline-none"
          >
            {drawerOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden lg:flex">
          <div className="flex flex-row items-center justify-center gap-x-8">
            {navigation.map((item) => (
              <Link
                key={item.id}
                to={item.url}
                className={`block font-code uppercase transition-colors hover:text-color-1 px-4 py-6 lg:text-xs lg:font-semibold ${
                  item.url === hash ? "lg:text-n-1" : "lg:text-n-1/50"
                } lg:hover:text-n-1`}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </nav>

        {/* Buttons */}
        {token ? (
          <button
            className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 border-2 hover:border-red-400 transition-all duration-300"
            onClick={logout}
          >
            Logout
          </button>
        ) : (
          <div className="hidden lg:flex items-center gap-x-4">
            <button
              className="px-4 py-2 rounded-lg text-white bg-purple-800 hover:bg-purple-900 border-2 hover:border-white transition-all duration-300"
              onClick={() => navigate("/register")}
            >
              New Account
            </button>
            <button
              className="px-4 py-2 rounded-lg text-white bg-purple-800 hover:bg-purple-900 border-2 hover:border-purple-400 transition-all duration-300"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        )}
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden bg-n-8 border-t border-n-6 px-6 py-4 space-y-4">
          {navigation.map((item) => (
            <Link
              key={item.id}
              to={item.url}
              onClick={() => setDrawerOpen(false)}
              className="block text-white text-sm font-medium hover:text-color-1 transition-colors"
            >
              {item.title}
            </Link>
          ))}
          <div className="mt-4">
            {token ? (
              <button
                className="w-full px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 border-2 hover:border-red-400 transition-all duration-300"
                onClick={logout}
              >
                Logout
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  className="w-full px-4 py-2 rounded-lg text-white bg-purple-800 hover:bg-purple-900 border-2 hover:border-white transition-all duration-300"
                  onClick={() => {
                    navigate("/register");
                    setDrawerOpen(false);
                  }}
                >
                  New Account
                </button>
                <button
                  className="w-full px-4 py-2 rounded-lg text-white bg-purple-800 hover:bg-purple-900 border-2 hover:border-purple-400 transition-all duration-300"
                  onClick={() => {
                    navigate("/login");
                    setDrawerOpen(false);
                  }}
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
