"use client";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
}

export function SearchBar({ value, onChange, resultCount }: SearchBarProps) {
  return (
    <div className="px-4 py-3 border-b border-slate-200 bg-white">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="주소, 단지명, 읍면동 검색"
          className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <p className="text-xs text-slate-400 mt-2">
        {value ? (
          <>
            검색 결과 <span className="font-semibold text-primary-500">{resultCount.toLocaleString()}</span>건
          </>
        ) : (
          <>
            전체 <span className="font-medium text-slate-500">{resultCount.toLocaleString()}</span>건
          </>
        )}
      </p>
    </div>
  );
}
