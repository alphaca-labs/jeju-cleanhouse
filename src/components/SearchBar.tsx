"use client";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
}

export function SearchBar({ value, onChange, resultCount }: SearchBarProps) {
  return (
    <div className="p-3 border-b border-slate-200 bg-white">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="주소 또는 지역명으로 검색"
          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
      <p className="mt-2 text-xs text-slate-500">
        {value ? (
          resultCount > 0 ? (
            <>
              검색결과 <span className="font-semibold text-primary-500">{resultCount.toLocaleString()}</span>건
            </>
          ) : (
            "검색 결과가 없습니다"
          )
        ) : (
          <>
            전체 <span className="font-semibold text-primary-500">{resultCount.toLocaleString()}</span>건
          </>
        )}
      </p>
    </div>
  );
}
