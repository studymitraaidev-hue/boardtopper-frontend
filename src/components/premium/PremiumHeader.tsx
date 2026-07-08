
// src/components/premium/PremiumHeader.tsx
import React from 'react';
import { Menu, Crown, Bell, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumHeaderProps {
  title?: string;
  subtitle?: string;
  streak?: number;
  notifications?: number;
  isPro?: boolean;
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
  className?: string;
}

export const PremiumHeader: React.FC<PremiumHeaderProps> = ({
  title,
  subtitle,
  streak = 0,
  notifications = 0,
  isPro = false,
  onMenuClick,
  onNotificationClick,
  className,
}) => {
  return (
    <header className={cn('sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50', className)}>
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>

          <div className="flex items-center gap-3">
            {streak > 0 && (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200/50">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-orange-600">{streak}-day streak</span>
              </div>
            )}

            {notifications > 0 && (
              <button
                onClick={onNotificationClick}
                className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-700" />
                {notifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
            )}

            {isPro && (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/50">
                <Crown className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-amber-600">Pro</span>
              </div>
            )}
          </div>
        </div>

        {(title || subtitle) && (
          <div className="mt-3">
            {title && <h1 className="text-xl font-bold text-gray-900">{title}</h1>}
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        )}
      </div>
    </header>
  );
};
