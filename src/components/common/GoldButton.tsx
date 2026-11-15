import React from 'react';
import { Rocket } from 'lucide-react';
import { spatialAudio } from '../../audio/SpatialAudioManager.ts';

interface GoldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const GoldButton: React.FC<GoldButtonProps> = ({
  children,
  icon = <Rocket className="w-5 h-5 text-stone-900 fill-stone-900" />,
  className = '',
  onClick,
  disabled,
  ...rest
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    spatialAudio.playUiClick(1100);
    if (onClick) onClick(e);
  };

  return (
    <button
      {...rest}
      disabled={disabled}
      onClick={handleClick}
      className={`gold-btn flex items-center justify-center gap-3 px-8 py-3.5 rounded-full cursor-pointer select-none text-base uppercase font-black ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
