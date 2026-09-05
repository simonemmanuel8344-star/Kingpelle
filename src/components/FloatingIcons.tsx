import React from 'react';
import { Code, Palette, Video, Camera, ShieldCheck, Zap, Star, DollarSign, Briefcase, Cpu } from 'lucide-react';

export function FloatingIcons() {
  const icons = [
    { Icon: Code, color: 'text-indigo-600', top: '15%', left: '8%', delay: '0s', duration: '6s', size: 'w-8 h-8' },
    { Icon: Palette, color: 'text-blue-400', top: '25%', right: '10%', delay: '1s', duration: '7s', size: 'w-7 h-7' },
    { Icon: ShieldCheck, color: 'text-emerald-400', top: '55%', left: '5%', delay: '2s', duration: '8s', size: 'w-9 h-9' },
    { Icon: Zap, color: 'text-indigo-500', top: '70%', right: '8%', delay: '1.5s', duration: '5.5s', size: 'w-6 h-6' },
    { Icon: Video, color: 'text-purple-400', top: '35%', left: '15%', delay: '3s', duration: '9s', size: 'w-8 h-8' },
    { Icon: Star, color: 'text-yellow-400', top: '80%', left: '20%', delay: '0.5s', duration: '6.5s', size: 'w-7 h-7' },
    { Icon: DollarSign, color: 'text-emerald-300', top: '20%R', right: '25%', delay: '2.5s', duration: '7.5s', size: 'w-6 h-6' },
    { Icon: Briefcase, color: 'text-blue-300', top: '65%', right: '22%', delay: '1.2s', duration: '8.5s', size: 'w-8 h-8' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {icons.map((item, idx) => {
        const IconComponent = item.Icon;
        return (
          <div
            key={idx}
            className={`absolute ${item.size} ${item.color} opacity-30 sm:opacity-40 filter drop-shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-float-bounce`}
            style={{
              top: item.top.includes('R') ? undefined : item.top,
              bottom: item.top.includes('R') ? '20%' : undefined,
              left: item.left,
              right: item.right,
              animationDelay: item.delay,
              animationDuration: item.duration,
            }}
          >
            <IconComponent className="w-full h-full animate-pulse" />
          </div>
        );
      })}
    </div>
  );
}
