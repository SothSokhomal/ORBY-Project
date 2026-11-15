import React, { useEffect } from 'react';
import { Info, CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'info' | 'success';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 3200,
}) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto animate-bounce-short">
      <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-slate-900/95 border border-purple-500/60 shadow-2xl text-slate-100 text-sm font-sans tracking-wide">
        {type === 'success' ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        ) : (
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        )}
        <span>{message}</span>
      </div>
    </div>
  );
};
