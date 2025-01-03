import React from 'react';
import { useCooldown } from '../hooks/useCooldown';
import CooldownIndicator from './CooldownIndicator';

interface GenerateButtonProps {
  onClick: () => Promise<boolean>;  // true: success, false: failure
  children: React.ReactNode;
  disabled?: boolean;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({ 
  onClick, 
  children,
  disabled = false
}) => {
  const { cooldown, startCooldown } = useCooldown(15000);

  const handleClick = async () => {
    if (cooldown.isActive || disabled) return;
    
    try {
      const success = await onClick();
      // 生成が成功した場合のみクールダウンを開始
      if (success) {
        startCooldown();
      }
    } catch (error) {
      console.error('Generation error:', error);
    }
  };

  return (
    <div className="relative inline-flex items-center gap-4">
      <button
        onClick={handleClick}
        disabled={cooldown.isActive || disabled}
        className={`px-6 py-3 rounded-lg font-medium text-white transition-all
          ${(cooldown.isActive || disabled)
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
          }`}
      >
        {children}
      </button>
      
      <CooldownIndicator 
        isActive={cooldown.isActive}
        remainingTime={cooldown.remainingTime}
      />
    </div>
  );
};

export default GenerateButton;