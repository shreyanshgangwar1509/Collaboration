import axios from "axios";
import { useEffect, useState } from "react";
import { FiPlus, FiUsers, FiLogOut, FiMessageSquare } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const getInitials = (name = "") =>
  name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

const Sidebar = ({ setSelectedGroup }) => {
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userInfo = (() => {
    try { return JSON.parse(localStorage.getItem("userinfo")) || {}; }
    catch { return {}; }
  })();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER}/api/groups`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGroups(data);
      if (userInfo._id) {
        const myGroupIds = data
          .filter(g => g.members?.some(m => m._id === userInfo._id))
          .map(g => g._id);
        setUserGroups(myGroupIds);
      }
    } catch {
      toast.error("Failed to fetch groups");
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) { toast.error("Group name required"); return; }
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER}/api/groups/create`,
        { name: newGroupName, description: newGroupDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Group created! 🎉");
      setShowCreateModal(false);
      setNewGroupName(""); setNewGroupDescription("");
      fetchGroups();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create group");
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER}/api/groups/${groupId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Joined group!");
      await fetchGroups();
      const g = groups.find(g => g._id === groupId);
      if (g) { setSelectedGroup(g); setSelectedId(groupId); }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to join");
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER}/api/groups/${groupId}/leave`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Left group");
      setSelectedGroup(null); setSelectedId(null);
      fetchGroups();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to leave");
    }
  };

  const selectGroup = (group) => {
    setSelectedGroup(group);
    setSelectedId(group._id);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--bg-secondary)", borderRight: "1px solid var(--border)" }}>
      {/* Header */}
      <div className="px-4 py-4 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <FiUsers style={{ color: "#7c3aed" }} size={18} />
          <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Groups</span>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "white" }}
          title="New Group"
        >
          <FiPlus size={14} />
        </button>
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {groups.length === 0 && (
          <div className="text-center py-8" style={{ color: "var(--text-muted)" }}>
            <FiMessageSquare size={24} className="mx-auto mb-2 opacity-40" />
            <p className="text-xs">No groups yet</p>
            <button onClick={() => setShowCreateModal(true)} className="text-xs mt-2" style={{ color: "#a78bfa" }}>
              Create first group →
            </button>
          </div>
        )}
        {groups.map((group) => {
          const joined = userGroups.includes(group._id);
          const active = selectedId === group._id;
          return (
            <div
              key={group._id}
              className="rounded-xl p-3 cursor-pointer transition-all duration-200"
              style={{
                background: active ? "rgba(124,58,237,0.15)" : joined ? "rgba(124,58,237,0.06)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${active ? "rgba(124,58,237,0.5)" : joined ? "rgba(124,58,237,0.2)" : "var(--border)"}`,
              }}
              onClick={() => joined && selectGroup(group)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="avatar avatar-sm flex-shrink-0">{getInitials(group.name)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {group.name}
                      </span>
                      {joined && (
                        <span className="badge badge-violet text-[10px]">member</span>
                      )}
                    </div>
                    {group.description && (
                      <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {group.description}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); joined ? handleLeaveGroup(group._id) : handleJoinGroup(group._id); }}
                  className={`text-xs px-2 py-1 rounded-lg font-medium flex-shrink-0 transition-all ${joined ? "hover:bg-red-500/10" : ""}`}
                  style={{
                    background: joined ? "rgba(239,68,68,0.1)" : "linear-gradient(135deg,#7c3aed,#4f46e5)",
                    color: joined ? "#f87171" : "white",
                    border: joined ? "1px solid rgba(239,68,68,0.2)" : "none",
                  }}
                >
                  {joined ? "Leave" : "Join"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Logout */}
      <div className="px-3 py-3 border-t flex-shrink-0" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("userinfo"); navigate("/login"); }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:bg-red-500/10"
          style={{ color: "var(--text-secondary)" }}
        >
          <FiLogOut size={14} /> <span>Sign Out</span>
        </button>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="glass-card p-6 w-full max-w-sm animate-slide-up">
            <h3 className="font-bold text-lg mb-4" style={{ color: "var(--text-primary)" }}>Create New Group</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                placeholder="Group name *"
                className="input-dark"
              />
              <input
                type="text"
                value={newGroupDescription}
                onChange={e => setNewGroupDescription(e.target.value)}
                placeholder="Description (optional)"
                className="input-dark"
              />
              <div className="flex gap-2 pt-2">
                <button onClick={handleCreateGroup} className="btn-primary flex-1 py-2">Create</button>
                <button onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1 py-2">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;