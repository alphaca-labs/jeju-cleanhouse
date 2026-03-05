"use client";

import { Home } from "lucide-react";

export function Header() {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 shrink-0 z-30">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
          <Home size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">
            제주 클린하우스
          </h1>
          <p className="text-[10px] text-slate-400 leading-tight">
            Jeju Clean House Finder
          </p>
        </div>
      </div>
    </header>
  );
}
