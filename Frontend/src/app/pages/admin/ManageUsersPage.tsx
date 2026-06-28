import { useState, useEffect, useRef } from "react";
import {
  Search, Shield, UserX, CheckCircle, Filter,
  Loader2, ChevronDown, Users, TrendingUp, Ban
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { adminApi, ApplicationUserDTO } from "../../api/adminApi";

// ─── Dropdown ────────────────────────────────────────────────────────────────
const FILTER_OPTIONS = [
  { label: "All Users",     value: "all" },
  { label: "Attendees",     value: "Attendee" },
  { label: "Organizers",    value: "Organizer" },
  { label: "Place Owners",  value: "Owner" },
  { label: "Admins",        value: "Admin" },
  { label: "──────────",   value: "divider" },
  { label: "Blocked Users", value: "blocked" },
];

function CustomDropdown({
  value, onChange
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = FILTER_OPTIONS.find(o => o.value === value) ?? FILTER_OPTIONS[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-['Inter:SemiBold',sans-serif] text-slate-700 hover:border-blue-300 hover:shadow-md transition-all duration-200 min-w-[160px] justify-between group"
      >
        <span className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
          {selected.label}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${open ? "-rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-[0_16px_48px_-12px_rgba(0,0,0,0.14)] z-50 overflow-hidden py-1.5"
          >
            {FILTER_OPTIONS.map((opt, i) => {
              if (opt.value === "divider") {
                return <li key={i} className="my-1.5 mx-4 h-px bg-slate-100" />;
              }
              const active = value === opt.value;
              return (
                <li key={opt.value}>
                  <button
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-[13px] flex items-center justify-between transition-colors ${
                      active
                        ? "text-blue-700 font-['Inter:Bold',sans-serif] bg-blue-50/60"
                        : "text-slate-600 font-['Inter:Medium',sans-serif] hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
                    {active && <CheckCircle className="w-3.5 h-3.5 text-blue-500" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const avatarColors = [
  { bg: "#EEF2FF", text: "#4F46E5" }, // Indigo
  { bg: "#F0FDF4", text: "#16A34A" }, // Emerald
  { bg: "#FFFBEB", text: "#D97706" }, // Amber
  { bg: "#FDF2F8", text: "#DB2777" }, // Pink
  { bg: "#F5F3FF", text: "#7C3AED" }, // Violet
  { bg: "#EFF6FF", text: "#2563EB" }, // Blue
];

function getAvatarColors(name: string) {
  const i = (name.charCodeAt(0) || 0) % avatarColors.length;
  return avatarColors[i];
}

function RoleBadge({ role }: { role: string | null }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    attendee:  { label: "Attendee",    bg: "#EFF6FF", color: "#2563EB" },
    organizer: { label: "Organizer",   bg: "#F5F3FF", color: "#7C3AED" },
    owner:     { label: "Place Owner", bg: "#FFFBEB", color: "#D97706" },
    admin:     { label: "Admin",       bg: "#FFF1F2", color: "#E11D48" },
  };
  const key = role?.toLowerCase() ?? "";
  const cfg = map[key] ?? { label: role ?? "User", bg: "#F8FAFC", color: "#64748B" };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-['Inter:Bold',sans-serif] whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {key === "admin" && <Shield className="w-3 h-3" />}
      {cfg.label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ManageUsersPage() {
  const [users, setUsers]           = useState<ApplicationUserDTO[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  async function fetchUsers() {
    setLoading(true);
    try {
      let data: ApplicationUserDTO[];
      if (roleFilter === "all")           data = await adminApi.getAllUsers();
      else if (roleFilter === "blocked")  data = await adminApi.getBlockedUsers();
      else                                data = await adminApi.getUsersByRole(roleFilter);
      setUsers(data ?? []);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, [roleFilter]);  // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (
      u.fullName?.toLowerCase().includes(q) ||
      u.userName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const totalActive  = users.filter(u => !u.isBlocked).length;
  const totalBlocked = users.filter(u =>  u.isBlocked).length;

  async function toggleBlock(user: ApplicationUserDTO) {
    const wasBlocked = user.isBlocked;
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isBlocked: !wasBlocked } : u));
    try {
      if (wasBlocked) {
        await adminApi.unblockUser(user.id);
        toast.success(`${user.fullName ?? user.email} is now active`);
      } else {
        await adminApi.blockUser(user.id);
        toast.error(`${user.fullName ?? user.email} has been blocked`);
      }
    } catch (e: any) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isBlocked: wasBlocked } : u));
      toast.error(`Failed: ${e.message}`);
    }
  }

  return (
    <div className="space-y-8">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-['Inter:Bold',sans-serif] text-slate-900 tracking-tight">
            Manage Users
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-['Inter:Medium',sans-serif]">
            Oversee, filter, and take action on all registered accounts.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-64 bg-white border border-slate-200 rounded-xl text-[13px] font-['Inter:Medium',sans-serif] placeholder:text-slate-400 text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/8 transition-all"
            />
          </div>
          <CustomDropdown value={roleFilter} onChange={setRoleFilter} />
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: Users,
            label: "Total Users",
            value: users.length,
            accent: "#3b82f6",
            bg: "#EFF6FF",
          },
          {
            icon: TrendingUp,
            label: "Active",
            value: totalActive,
            accent: "#10b981",
            bg: "#F0FDF4",
          },
          {
            icon: Ban,
            label: "Blocked",
            value: totalBlocked,
            accent: "#ef4444",
            bg: "#FFF1F2",
          },
        ].map(stat => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-white rounded-2xl border border-slate-100 px-6 py-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: stat.bg }}
            >
              <stat.icon className="w-5 h-5" style={{ color: stat.accent }} />
            </div>
            <div>
              <p className="text-2xl font-['Inter:Bold',sans-serif] text-slate-900">{stat.value}</p>
              <p className="text-[12px] font-['Inter:SemiBold',sans-serif] text-slate-500 uppercase tracking-wide">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Table card ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        {/* Table header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <p className="text-[13px] font-['Inter:SemiBold',sans-serif] text-slate-500">
            Showing <span className="text-slate-900 font-['Inter:Bold',sans-serif]">{filtered.length}</span> users
          </p>
        </div>

        <div className="overflow-x-auto relative min-h-[400px]">
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-20">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          )}

          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-widest text-slate-400 font-['Inter:Bold',sans-serif] border-b border-slate-100 bg-slate-50/60">
                <th className="px-6 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {!loading && filtered.map((user, i) => {
                  const name   = user.fullName ?? user.userName ?? "Unknown";
                  const letter = name.charAt(0).toUpperCase();
                  const colors = getAvatarColors(name);

                  return (
                    <motion.tr
                      key={user.id ?? user.email}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Avatar + name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-['Inter:Bold',sans-serif] flex-shrink-0"
                            style={{ backgroundColor: colors.bg, color: colors.text }}
                          >
                            {letter}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[14px] font-['Inter:SemiBold',sans-serif] text-slate-800 truncate">{name}</p>
                            <p className="text-[12px] font-['Inter:Medium',sans-serif] text-slate-400 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-4">
                        <RoleBadge role={user.role} />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${user.isBlocked ? "bg-rose-500" : "bg-emerald-500"}`} />
                          <span className={`text-[13px] font-['Inter:SemiBold',sans-serif] ${user.isBlocked ? "text-rose-600" : "text-emerald-600"}`}>
                            {user.isBlocked ? "Blocked" : "Active"}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-[13px] font-['Inter:Medium',sans-serif] text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        {user.role?.toLowerCase() === "admin" ? (
                          <span className="text-[12px] font-['Inter:SemiBold',sans-serif] text-slate-400 px-3 py-1.5 bg-slate-100 rounded-lg">
                            Protected
                          </span>
                        ) : user.isBlocked ? (
                          <button
                            onClick={() => toggleBlock(user)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-['Inter:Bold',sans-serif] bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleBlock(user)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-['Inter:Bold',sans-serif] bg-white border-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <UserX className="w-4 h-4" />
                            Block
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>

              {/* Empty state */}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                        <Search className="w-7 h-7 text-slate-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-[15px] font-['Inter:Bold',sans-serif] text-slate-700">No users found</p>
                        <p className="text-[13px] font-['Inter:Medium',sans-serif] text-slate-400 mt-1">
                          Try changing your search or filter.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
