import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiTrash2, FiClock, FiActivity, FiArrowRight, FiSave, FiFolder } from "react-icons/fi";

const featureLinks = [
  { id: 'CHAT', icon: "💬", label: "Chat", path: "/chat", color: "#7c3aed" },
  { id: 'CODE', icon: "🖊️", label: "Code", path: "/home/editor", color: "#4f46e5" },
  { id: 'WHITEBOARD', icon: "🎨", label: "Whiteboard", path: "/whiteboard", color: "#06b6d4" },
  { id: 'DOCS', icon: "📄", label: "Docs", path: "/docs", color: "#10b981" },
  { id: 'PPT', icon: "📊", label: "PPT", path: "/ppt", color: "#f59e0b" },
  { id: 'PHOTO', icon: "🖼️", label: "Photo", path: "/photoshop", color: "#ec4899" },
  { id: 'CHATBOT', icon: "🤖", label: "AI Chat", path: "/chatbot", color: "#8b5cf6" },
];

const Profile = () => {
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("activity"); // activity | saved
  const [filter, setFilter] = useState("ALL");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }
      try {
        const [profRes, actRes, saveRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_SERVER}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${import.meta.env.VITE_SERVER}/api/activity`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${import.meta.env.VITE_SERVER}/api/saved`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setUser(profRes.data.user);
        setActivities(actRes.data.activities);
        setSavedItems(saveRes.data.items);
        localStorage.setItem("userinfo", JSON.stringify(profRes.data.user));
      } catch (err) {
        toast.error("Session expired.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [navigate]);

  const clearHistory = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${import.meta.env.VITE_SERVER}/api/activity/clear`, { headers: { Authorization: `Bearer ${token}` } });
      setActivities([]);
      toast.success("Activity cleared");
    } catch {
      toast.error("Failed to clear history");
    }
  };

  const deleteSavedItem = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${import.meta.env.VITE_SERVER}/api/saved/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setSavedItems(prev => prev.filter(item => item._id !== id));
      toast.success("Item removed");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userinfo");
    toast.success("Logged out");
    navigate("/login");
  };

  const filteredActivities = filter === "ALL" ? activities : activities.filter(a => a.type === filter);
  const filteredSaved = filter === "ALL" ? savedItems : savedItems.filter(s => s.type === filter);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#07070f]">
       <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent animate-spin rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 lg:px-12 bg-[#07070f] text-white">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        
        {/* LEFT COLUMN: PERSONAL INFO & QUICK LAUNCH */}
        <div className="flex-1 space-y-8 animate-slide-up">
          <div className="glass-card p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 blur-[80px] group-hover:bg-violet-600/10 transition-all pointer-events-none" />
            <div className="flex items-center gap-8 flex-col sm:flex-row text-center sm:text-left">
               <div className="relative">
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-4xl font-bold shadow-2xl shadow-violet-600/20">
                     {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-[#14141f]" />
               </div>
               <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-1">{user?.name}</h1>
                  <p className="text-gray-400 mb-4">{user?.email}</p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                     <span className="badge badge-violet lowercase tracking-normal">id: {user?._id?.slice(-6)}</span>
                     <span className="badge badge-green">Level: Pro Member</span>
                     <button onClick={handleLogout} className="text-xs text-red-400 hover:underline ml-2">Logout</button>
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Quick Tools</h2>
                <div className="h-px flex-1 bg-white/5 ml-4" />
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {featureLinks.map(f => (
                  <Link key={f.path} to={f.path} className="glass-card p-5 group no-underline hover:-translate-y-1 transition-all">
                     <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{f.icon}</div>
                     <p className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-white">{f.label}</p>
                  </Link>
                ))}
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TABS SIDEBAR (Activity & Saved) */}
        <div className="w-full lg:w-[450px] flex-shrink-0 space-y-6 animate-slide-right">
           <div className="glass-card flex flex-col min-h-[650px] overflow-hidden">
              
              {/* Tab Switcher */}
              <div className="flex border-b border-white/5">
                 <button 
                  onClick={() => setActiveTab("activity")}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "activity" ? 'bg-white/5 text-violet-400 border-b-2 border-violet-500' : 'text-gray-500 hover:text-white'}`}
                 >
                   <FiActivity /> Activity
                 </button>
                 <button 
                  onClick={() => setActiveTab("saved")}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "saved" ? 'bg-white/5 text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-white'}`}
                 >
                   <FiSave /> Saved Work
                 </button>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-2 flex-wrap">
                       {['ALL', 'CODE', 'DOCS', 'PHOTO', 'WHITEBOARD'].map(f => (
                          <button 
                             key={f}
                             onClick={() => setFilter(f)}
                             className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-tighter border transition-all ${filter === f ? 'bg-violet-600 border-violet-500 text-white' : 'border-white/10 text-gray-500 hover:border-white/20'}`}
                          >
                             {f}
                          </button>
                       ))}
                    </div>
                    {activeTab === "activity" && (
                       <button onClick={clearHistory} className="p-2 text-gray-500 hover:text-red-400 transition-colors" title="Clear History">
                          <FiTrash2 size={16} />
                       </button>
                    )}
                 </div>

                 {/* Tab Content */}
                 <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scroll">
                    {activeTab === "activity" ? (
                       // ACTIVITY FEED
                       filteredActivities.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                             <FiClock size={40} className="mb-4" />
                             <p className="text-sm">No recent activity</p>
                          </div>
                       ) : (
                          filteredActivities.map((act, i) => (
                             <div key={act?._id || i} className="group flex gap-4 p-4 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 text-lg group-hover:bg-violet-600/20 group-hover:text-violet-400 transition-colors">
                                   {featureLinks.find(f => f.id === act.type)?.icon || '📍'}
                                </div>
                                <div className="flex-1 min-w-0">
                                   <div className="flex justify-between items-start mb-0.5">
                                      <p className="text-xs font-bold truncate">{act.action}</p>
                                      <span className="text-[9px] text-gray-500 whitespace-nowrap ml-2">
                                         {new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                      </span>
                                   </div>
                                   <p className="text-[10px] text-gray-500 truncate">
                                      {act.roomId ? `Room: ${act.roomId.slice(0, 8)}...` : act.details}
                                   </p>
                                </div>
                             </div>
                          ))
                       )
                    ) : (
                       // SAVED ITEMS FEED
                       filteredSaved.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                             <FiFolder size={40} className="mb-4" />
                             <p className="text-sm">No saved work yet</p>
                          </div>
                       ) : (
                          filteredSaved.map((item, i) => (
                             <div key={item?._id || i} className="group relative flex gap-4 p-4 rounded-xl hover:bg-white/[0.03] border border-emerald-500/10 hover:border-emerald-500/30 transition-all bg-emerald-500/[0.02]">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 text-lg">
                                   {featureLinks.find(f => f.id === item.type)?.icon || '📁'}
                                </div>
                                <div className="flex-1 min-w-0">
                                   <div className="flex justify-between items-start mb-0.5">
                                      <p className="text-xs font-bold truncate text-emerald-100">{item.title}</p>
                                      <button onClick={() => deleteSavedItem(item._id)} className="text-gray-500 hover:text-red-400 transition-opacity opacity-0 group-hover:opacity-100">
                                         <FiTrash2 size={12} />
                                      </button>
                                   </div>
                                   <p className="text-[10px] text-emerald-400/60 mb-2">
                                      {item.type} • {new Date(item.timestamp).toLocaleDateString()}
                                   </p>
                                   <button 
                                    onClick={() => {
                                       // Open a modal or copy to clipboard for now
                                       navigator.clipboard.writeText(item.content);
                                       toast.success("Content copied to clipboard!");
                                    }}
                                    className="text-[9px] font-bold text-white px-2 py-1 rounded bg-emerald-600/40 hover:bg-emerald-600 transition-colors uppercase"
                                   >
                                      Copy Content
                                   </button>
                                </div>
                             </div>
                          ))
                       )
                    )}
                 </div>
              </div>

              <div className="p-6 pt-0">
                 <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[9px] text-gray-500 leading-tight">
                       Your saved work is encrypted and stored securely in your profile. You can access it anytime from any device.
                    </p>
                 </div>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
