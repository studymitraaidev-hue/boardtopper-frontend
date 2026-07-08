// src/components/premium/GlassCard.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark' | 'gradient' | 'colored';
  color?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = 'light',
  color,
  hover = true,
  onClick,
}) => {
  const baseStyles = 'rounded-2xl backdrop-blur-xl border transition-all duration-300';

  const variants = {
    light: 'bg-white/70 border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)]',
    dark: 'bg-gray-900/70 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
    gradient: 'bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-indigo-200/30',
    colored: color ? `bg-gradient-to-br ${color} border-white/20` : 'bg-white/70',
  };

  const hoverStyles = hover
    ? 'hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1 cursor-pointer'
    : '';

  return (
    <div
      className={cn(baseStyles, variants[variant], hoverStyles, className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
