import React from 'react';
import { spatialAudio } from '../../audio/SpatialAudioManager.ts';

interface MetalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'back' | 'next';
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const MetalButton: React.FC<MetalButtonProps> = ({
  variant = 'primary',
  children,
  icon,
  className = '',
  onClick,
  disabled,
  ...rest
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    spatialAudio.playUiClick(850);
    if (onClick) onClick(e);
  };

  return (
    <button
      {...rest}
      disabled={disabled}
      onClick={handleClick}
      className={`metal-btn flex items-center justify-center gap-2 cursor-pointer select-none rounded-xl active:scale-[0.98] ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
