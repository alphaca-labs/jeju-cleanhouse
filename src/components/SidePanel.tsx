"use client";

import { CleanHouse } from "@/types";
import { SearchBar } from "./SearchBar";
import { LocationCard } from "./LocationCard";
import { MapPin } from "lucide-react";

interface SidePanelProps {
  items: CleanHouse[];
  allItems: CleanHouse[];
  search: string;
  onSearchChange: (value: string) => void;
  selectedItem: CleanHouse | null;
  onSelect: (item: CleanHouse) => void;
  districts: string[];
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
}

export function SidePanel({
  items,
  allItems,
  search,
  onSearchChange,
  selectedItem,
  onSelect,
  districts,
  selectedDistrict,
  onDistrictChange,
}: SidePanelProps) {
  return (
    <aside className="hidden md:flex md:flex-col w-96 border-r border-slate-200 bg-white shrink-0">
      <SearchBar
        value={search}
        onChange={onSearchChange}
        resultCount={items.length}
      />

      {/* District filter */}
      <div className="px-4 py-2 border-b border-slate-100">
        <select
          value={selectedDistrict}
          onChange={(e) => onDistrictChange(e.target.value)}
          className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        >
          <option value="">전체 읍면동</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <MapPin size={32} className="mb-3 text-slate-300" />
            <p className="text-sm font-medium">검색 결과가 없습니다</p>
            <p className="text-xs mt-1">다른 검색어를 입력해보세요</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <LocationCard
              key={`${item.lat}-${item.lng}-${idx}`}
              item={item}
              isSelected={selectedItem === item}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </aside>
  );
}
