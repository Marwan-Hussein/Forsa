import { useState } from "react";
import { Search, Shield, UserX, CheckCircle, Trash2, Filter, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type UserRole = "attendee" | "organization" | "place_owner";
type UserStatus = "active" | "suspended";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;
}

const MOCK_USERS: User[] = [
  { id: "1", name: "Ahmed Ali", email: "ahmed@example.com", role: "attendee", status: "active", joinedAt: "2026-01-15" },
  { id: "2", name: "Tech Corp", email: "contact@techcorp.com", role: "organization", status: "active", joinedAt: "2026-02-20" },
  { id: "3", name: "Grand Hall", email: "admin@grandhall.com", role: "place_owner", status: "suspended", joinedAt: "2026-03-05" },
  { id: "4", name: "Sara Sayed", email: "sara@example.com", role: "attendee", status: "active", joinedAt: "2026-04-10" },
  { id: "5", name: "Music Vibes", email: "hello@musicvibes.com", role: "organization", status: "active", joinedAt: "2026-05-01" },
];

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const toggleStatus = (id: string) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === "active" ? "suspended" : "active" };
      }
      return u;
    }));
  };

  const deleteUser = (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "attendee": return <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-['Inter:Medium',sans-serif] shadow-sm">Attendee</span>;
      case "organization": return <span className="px-3 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg text-xs font-['Inter:Medium',sans-serif] shadow-sm">Organizer</span>;
      case "place_owner": return <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-['Inter:Medium',sans-serif] shadow-sm">Place Owner</span>;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 tracking-tight">Manage Users</h1>
          <p className="text-slate-500 font-['Inter:Regular',sans-serif] mt-1">View, filter, and manage user accounts across the platform.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-[rgba(39,55,77,0.1)] rounded-xl focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/50 shadow-sm transition-all w-full sm:w-64 font-['Inter:Regular',sans-serif] text-[14px]"
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-white border border-[rgba(39,55,77,0.1)] rounded-xl focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/50 shadow-sm transition-all w-full appearance-none cursor-pointer font-['Inter:Medium',sans-serif] text-[14px] text-slate-700"
            >
              <option value="all">All Roles</option>
              <option value="attendee">Attendees</option>
              <option value="organization">Organizers</option>
              <option value="place_owner">Place Owners</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[rgba(39,55,77,0.1)] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-[13px] font-['Inter:Medium',sans-serif] uppercase tracking-wider">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {filteredUsers.map((user) => (
                  <motion.tr 
                    key={user.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-700 font-bold shrink-0 shadow-sm border border-slate-200/50 group-hover:scale-105 transition-transform">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-['Inter:Bold',sans-serif] font-bold text-slate-800">{user.name}</p>
                          <p className="text-sm font-['Inter:Regular',sans-serif] text-slate-500 mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-['Inter:Bold',sans-serif] font-bold shadow-sm border ${
                        user.status === 'active' 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                          : 'bg-rose-50 border-rose-200 text-rose-700'
                      }`}>
                        {user.status === 'active' ? <CheckCircle className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[14px] font-['Inter:Medium',sans-serif] text-slate-600">
                      {user.joinedAt}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => toggleStatus(user.id)}
                          className={`p-2 rounded-lg transition-colors border shadow-sm ${
                            user.status === 'active' 
                              ? 'text-amber-600 bg-white hover:bg-amber-50 border-amber-200' 
                              : 'text-emerald-600 bg-white hover:bg-emerald-50 border-emerald-200'
                          }`}
                          title={user.status === 'active' ? "Suspend User" : "Activate User"}
                        >
                          {user.status === 'active' ? <UserX className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => deleteUser(user.id)}
                          className="p-2 text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 shadow-sm rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Search className="w-8 h-8 mb-3 opacity-20" />
                      <p className="font-['Inter:Medium',sans-serif]">No users found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
