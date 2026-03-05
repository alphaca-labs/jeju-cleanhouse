"use client";

export function Header() {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 shrink-0 z-30">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-lg">
          🏝️
        </div>
        <h1 className="text-base font-bold text-slate-900 leading-tight">
          제주 클린하우스
        </h1>
      </div>
    </header>
  );
}
