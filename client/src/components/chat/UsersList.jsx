import { FiUsers } from "react-icons/fi";

const getInitials = (name = "") =>
  name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

const UsersList = ({ users = [] }) => {
  return (
    <div className="flex flex-col h-full" style={{ background: "var(--bg-secondary)" }}>
      <div className="px-4 py-3 border-b flex items-center gap-2 flex-shrink-0" style={{ borderColor: "var(--border)" }}>
        <FiUsers size={16} style={{ color: "#7c3aed" }} />
        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Online</span>
        <span className="badge badge-green ml-auto">{users.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {users.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>No users online</p>
        ) : (
          users.map((user) => (
            <div
              key={user.socketId || user._id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}
            >
              <div className="relative flex-shrink-0">
                <div className="avatar avatar-sm">{getInitials(user.name)}</div>
                <div className="online-dot absolute -bottom-0.5 -right-0.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{user.name}</p>
                <p className="text-xs" style={{ color: "#10b981" }}>Online</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UsersList;