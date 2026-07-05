import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../hooks/useDashboard';
import {
  LayoutDashboard, MessageSquare, FileText, ClipboardList,
  Zap, GraduationCap, LogOut, Crown, ChevronRight, TrendingUp, Bell, BookMarked,
  Settings
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard',        icon: LayoutDashboard, path: '/dashboard'      },
  { name: 'Doubt Solver',     icon: MessageSquare,   path: '/doubt-solver'   },
  { name: 'Smart Notes',      icon: FileText,        path: '/notes'         },
  { name: 'My Notes',         icon: BookMarked,      path: '/my-notes'      },
  { name: 'Exam Simulation',  icon: ClipboardList,   path: '/simulation'    },
  { name: 'Likely Questions', icon: TrendingUp,      path: '/likely-questions' },
  { name: 'Emergency Mode',   icon: Zap,             path: '/emergency', special: true },
  { name: 'Settings',         icon: Settings,        path: '/settings'      },
];

interface SidebarProps { className?: string; }

export const Sidebar = ({ className }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isPro } = useAuth();
  const { progress } = useDashboard();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initial = user?.name?.[0]?.toUpperCase() ?? 'U';
  const displayName = user?.name ?? 'Student';
  const planLabel = isPro ? 'Topper Pro' : 'Free Plan';

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col bg-gradient-to-b from-[#0b0a14] via-[#11101f] to-[#0b0a14] border-r border-white/[0.06] transition-all duration-300 relative overflow-hidden',
        collapsed ? 'w-18' : 'w-64',
        'h-screen sticky top-0 shrink-0',
        className
      )}
      aria-label="Sidebar navigation"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-20 -left-10 w-56 h-56 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -right-10 w-48 h-48 rounded-full bg-violet-600/10 blur-3xl" />

      {/* Logo */}
      <div className={cn('relative flex items-center h-16 border-b border-white/[0.06]', collapsed ? 'justify-center px-3' : 'px-5 gap-3')}>
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-1.5 rounded-xl shrink-0 shadow-lg shadow-indigo-900/40">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-base font-extrabold text-white tracking-tight">
            BoardTopper<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className={cn('relative flex-1 overflow-y-auto py-5', collapsed ? 'px-2' : 'px-3')} aria-label="Dashboard navigation">
        {!collapsed && (
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-3">Main Menu</p>
        )}
        <ul className="space-y-1" role="list">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <li key={item.path} role="listitem">
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center rounded-xl transition-all duration-200 font-semibold text-sm relative group',
                    collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5',
                    active
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-900/40'
                      : item.special
                      ? 'text-amber-400 hover:bg-amber-400/10'
                      : 'text-white/50 hover:bg-white/[0.06] hover:text-white'
                  )}
                  title={collapsed ? item.name : undefined}
                  aria-current={active ? 'page' : undefined}
                >
                  <item.icon size={18} className={cn('shrink-0', active ? 'text-white' : item.special ? 'text-amber-400' : '')} />
                  {!collapsed && <span>{item.name}</span>}
                  {!collapsed && active && <ChevronRight size={14} className="ml-auto text-white/70" />}
                </Link>
              </li>
            );
          })}
        </ul>

        {!collapsed && (
          <>
            <div className="h-px bg-white/[0.06] my-5 mx-3" />
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-3">Quick Stats</p>
            <div className="mx-3 space-y-2">
              <div className="flex items-center justify-between bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-emerald-400" />
                  <span className="text-xs font-semibold text-white/60">Streak</span>
                </div>
                <span className="text-xs font-bold text-emerald-400">{progress.streakCount} days 🔥</span>
              </div>
              <div className="flex items-center justify-between bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-indigo-400" />
                  <span className="text-xs font-semibold text-white/60">Doubts</span>
                </div>
                <span className="text-xs font-bold text-indigo-400">{progress.doubtsSolved} solved</span>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Upgrade Banner */}
      {!collapsed && !isPro && (
        <div className="relative mx-3 mb-3">
          <Link to="/pricing" className="block">
            <div className="bg-gradient-to-br from-indigo-600/25 to-violet-600/15 border border-indigo-400/20 rounded-2xl p-4 group hover:border-indigo-400/40 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <Crown size={14} className="text-amber-400" />
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Free Plan</p>
              </div>
              <p className="text-xs font-semibold text-white/60 mb-3">Upgrade to unlock unlimited AI, PDF notes & full mock tests.</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-white">₹99/mo</span>
                <span className="text-[10px] font-bold text-indigo-300 group-hover:text-indigo-200 uppercase tracking-wider flex items-center gap-1">
                  Upgrade <ChevronRight size={10} />
                </span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* User */}
      <div className={cn('relative border-t border-white/[0.06] py-3', collapsed ? 'px-2 flex justify-center' : 'px-3')}>
        {collapsed ? (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-900/40">
            {initial}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-indigo-900/40">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{displayName}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-tighter">{planLabel}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
