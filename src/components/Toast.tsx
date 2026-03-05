"use client";

import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
}

export function Toast({ message, visible, onClose }: ToastProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (visible) {
      setExiting(false);
      const timer = setTimeout(() => {
        setExiting(true);
        setTimeout(onClose, 200);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible && !exiting) return null;

  return (
    <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[9999]">
      <div
        className={`flex items-center gap-2 px-4 py-3 bg-slate-800 text-white text-sm rounded-lg shadow-lg ${
          exiting ? "toast-exit" : "toast-enter"
        }`}
      >
        <CheckCircle size={16} className="text-accent-400 shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  );
}
