import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user);
        localStorage.setItem("userinfo", JSON.stringify(response.data.user));
      } catch (error) {
        console.error("Error fetching profile:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div></div>;
  }

  if (!user) {
    return <p className="text-center text-red-500">Failed to load profile.</p>;
  }

  const getInitialAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white shadow-lg rounded-lg p-8 text-center max-w-sm">
        <img
          className="w-24 h-24 rounded-full mx-auto mb-4"
          src={user.avatar || getInitialAvatar(user.name)}
          alt={user.name}
        />
        <h2 className="text-2xl font-semibold mb-2">{user.name}</h2>
        <p className="text-gray-600 text-lg">{user.email}</p>
        <button
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
