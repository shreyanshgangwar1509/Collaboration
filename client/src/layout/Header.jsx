import { Link, useLocation } from "react-router-dom";
import { navigation } from "../constants/constants.js";

const Header = () => {
  const { hash } = useLocation();

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-n-8/90 backdrop-blur-sm border-b border-n-6 pl-[16.8rem]">
      <div className="flex items-center px-5 lg:px-7.5 xl:px-10 max-lg:py-4">
        <nav className="hidden lg:flex lg:mx-auto">
          <div className="flex flex-row items-center justify-center">
            {navigation.map((item) => (
              <Link
                key={item.id}
                to={item.url}
                className={`block font-code uppercase transition-colors hover:text-color-1 px-6 py-6 lg:px-6 xl:px-12 lg:text-xs lg:font-semibold ${
                  item.url === hash ? "lg:text-n-1" : "lg:text-n-1/50"
                } lg:hover:text-n-1`}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </nav>

        <div className="flex items-center">
          <button className="px-6 py-2 m-3 rounded-lg text-white bg-purple-800 hover:bg-purple-900 hover:border-white border-2 transition-all duration-300">
            New Account
          </button>

          <button className="px-6 py-2 m-3 rounded-lg text-white bg-purple-800 hover:bg-purple-900 border-2 hover:border-purple-400 transition-all duration-300">
            Login
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
