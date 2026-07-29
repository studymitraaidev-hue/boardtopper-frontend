import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import {
  LayoutDashboard,
  MessageCircle,
  BookOpen,
  Trophy,
  Zap,
  Settings,
  Gift,
} from 'lucide-react';

// ─── Tab definitions ─────────────────────────────

const TABS = [
  {
    label: 'Dashboard',
    to:    '/dashboard',
    icon:  LayoutDashboard,
    match: ['/dashboard'],
  },
  {
    label: 'Doubt',
    to:    '/doubt-solver',
    icon:  MessageCircle,
    match: ['/doubt-solver'],
  },
  {
    label: 'Notes',
    to:    '/notes',
    icon:  BookOpen,
    match: ['/notes', '/my-notes'],
  },
  {
    label: 'Test',
    to:    '/simulation',
    icon:  Trophy,
    match: ['/simulation'],
  },
  {
    label: 'Top Qs',
    to:    '/likely-questions',
    icon:  Zap,
    match: ['/likely-questions'],
  },
  {
    label: 'Settings',
    to:    '/settings',
    icon:  Settings,
  Gift,
    match: ['/settings'],
  },
] as const;

// ─── Component ─────────────────────────────

/**
 * BottomNav
 *
 * Persistent bottom navigation bar for mobile screens (< 768px).
 * Hidden on md and above — the sidebar handles navigation there.
 *
 * Fixed to the bottom of the viewport with safe-area padding so it
 * works correctly on iPhones with home indicator bars.
 *
 * Each tab is a full Link covering the entire tap target.
 * Minimum height 56px (h-14) for comfortable thumb tapping.
 *
 * Labels are kept to a single word each — six equal-width columns on a
 * narrow phone don't have room for a two-word label without wrapping,
 * and a wrapped label breaks vertical alignment with its neighbors.
 */
export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Bottom navigation"
      className={cn(
        // Only visible below md breakpoint
        'fixed bottom-0 left-0 right-0 z-30 md:hidden',
        // Background and border
        'bg-white/95 backdrop-blur-md border-t border-slate-100',
        // Safe area for iPhone home indicator
        'pb-safe',
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-stretch h-14">
        {TABS.map((tab) => {
          const Icon      = tab.icon;
          const isActive  = tab.match.some((path) => pathname === path);

          return (
            <Link
              key={tab.to}
              to={tab.to}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                // relative so the absolute dot positions inside this Link
                'relative',
                // Fill equal space, stack icon + label, center both axes
                'flex-1 flex flex-col items-center justify-center gap-0.5',
                // Touch target — full height of nav bar (h-14 = 56px)
                'min-h-[56px]',
                // Small horizontal breathing room so labels don't crowd neighbors
                'px-1',
                // Smooth colour transition
                'transition-colors duration-150',
                // Active vs inactive colours
                isActive
                  ? 'text-indigo-600'
                  : 'text-slate-400 hover:text-slate-600 active:text-slate-700',
              )}
            >
              {/* Icon — filled variant for active, outline for inactive */}
              <Icon
                size={20}
                className={cn(
                  'transition-transform duration-150',
                  isActive && 'scale-110',
                )}
                strokeWidth={isActive ? 2.5 : 1.75}
              />

              {/* Label — single word, no wrap, no letter-spacing to keep it tight */}
              <span
                className={cn(
                  'text-[10px] font-black leading-none whitespace-nowrap',
                  isActive ? 'text-indigo-600' : 'text-slate-400',
                )}
              >
                {tab.label}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <span
                  className="absolute bottom-1.5 w-1 h-1 rounded-full bg-indigo-600"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
