import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  delay?: number;
}

export default function GlassCard({ children, className = '', onClick, hover = false }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl
        shadow-[0_8px_32px_rgba(0,0,0,0.2)]
        transition-transform duration-200
        ${hover ? 'cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
