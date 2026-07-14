
// src/components/premium/BottomNav.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageCircle, BookOpen, Trophy, Zap, Settings, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/doubt', label: 'Doubt', icon: MessageCircle },
  { path: '/notes', label: 'Notes', icon: BookOpen },
  { path: '/arena', label: 'Arena', icon: Swords },
  { path: '/test', label: 'Test', icon: Trophy },
  { path: '/top-qs', label: 'Top Qs', icon: Zap },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-100/50 safe-area-pb">
      <div className="max-w-lg mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200',
                  isActive
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
                <span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
