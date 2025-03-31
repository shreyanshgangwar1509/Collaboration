import { Link, useLocation, useNavigate } from "react-router-dom";
import { navigation } from "../constants/constants.js";
const Header = () => {
  const { hash } = useLocation();
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-n-8/90 backdrop-blur-sm border-b border-n-6 pl-[16.8rem]">
      <div className="flex justify-between items-center px-8 mt-3">
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

        <div className="flex items-center gap-x-4">
          <button className="px-6 py-2 rounded-lg text-white bg-purple-800 hover:bg-purple-900 border-2 hover:border-white transition-all duration-300"
            onClick={()=>navigate('/register')}>
            New Account
          </button>

          <button className="px-6 py-2 rounded-lg text-white bg-purple-800 hover:bg-purple-900 border-2 hover:border-purple-400 transition-all duration-300"
          onClick={()=>navigate('/login')}>
            Login
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
