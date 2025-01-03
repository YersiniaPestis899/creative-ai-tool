import { useState, useEffect } from 'react';

type CooldownState = {
  isActive: boolean;
  remainingTime: number;
};

export const useCooldown = (durationMs: number = 15000) => {
  const [cooldown, setCooldown] = useState<CooldownState>({
    isActive: false,
    remainingTime: 0
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown.isActive && cooldown.remainingTime > 0) {
      timer = setInterval(() => {
        setCooldown(prev => ({
          ...prev,
          remainingTime: Math.max(0, prev.remainingTime - 100),
          isActive: prev.remainingTime > 100
        }));
      }, 100);
    }
    return () => clearInterval(timer);
  }, [cooldown.isActive, cooldown.remainingTime]);

  const startCooldown = () => {
    setCooldown({
      isActive: true,
      remainingTime: durationMs
    });
  };

  return { cooldown, startCooldown };
};