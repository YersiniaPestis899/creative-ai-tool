import React from 'react';

interface CooldownIndicatorProps {
  isActive: boolean;
  remainingTime: number;
  totalTime?: number;
}

const CooldownIndicator: React.FC<CooldownIndicatorProps> = ({ 
  isActive, 
  remainingTime, 
  totalTime = 15000 
}) => {
  if (!isActive) return null;

  const progress = (remainingTime / totalTime) * 100;
  const seconds = Math.ceil(remainingTime / 1000);

  return (
    <div className="relative w-16 h-16">
      {/* マジカルな背景エフェクト */}
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-full opacity-20" />
      
      {/* クールダウンサークル */}
      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="8"
        />
        
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#cooldownGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 45 * progress / 100} ${2 * Math.PI * 45}`}
          className="transition-all duration-100"
        />
        
        <defs>
          <linearGradient id="cooldownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* カウントダウンテキスト */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
          {seconds}
        </span>
      </div>
      
      {/* キラキラエフェクト */}
      <div className="absolute inset-0 animate-spin-slow">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-50"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 60}deg) translateY(-25px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CooldownIndicator;