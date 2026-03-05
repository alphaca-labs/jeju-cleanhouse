"use client";

import { CleanHouse } from "@/types";
import { SearchBar } from "./SearchBar";
import { LocationCard } from "./LocationCard";

interface SidePanelProps {
  items: CleanHouse[];
  query: string;
  onQueryChange: (q: string) => void;
  districts: string[];
  selectedDistrict: string;
  onDistrictChange: (d: string) => void;
  selectedItem: CleanHouse | null;
  onSelectItem: (item: CleanHouse) => void;
}

export function SidePanel({
  items,
  query,
  onQueryChange,
  districts,
  selectedDistrict,
  onDistrictChange,
  selectedItem,
  onSelectItem,
}: SidePanelProps) {
  return (
    <div className="hidden md:flex flex-col w-96 h-full bg-slate-50 border-r border-gray-200">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900 mb-3">
          🏝️ 제주 클린하우스
        </h1>
        <SearchBar
          query={query}
          onQueryChange={onQueryChange}
          districts={districts}
          selectedDistrict={selectedDistrict}
          onDistrictChange={onDistrictChange}
          resultCount={items.length}
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <span className="text-4xl mb-2">🔍</span>
            <p className="text-sm">검색 결과가 없습니다</p>
          </div>
        ) : (
          items.slice(0, 100).map((item, i) => (
            <LocationCard
              key={`${item.lat}-${item.lng}-${i}`}
              item={item}
              isSelected={
                selectedItem?.lat === item.lat &&
                selectedItem?.lng === item.lng
              }
              onClick={() => onSelectItem(item)}
            />
          ))
        )}
        {items.length > 100 && (
          <p className="text-center text-xs text-gray-400 py-2">
            검색어로 범위를 좁혀보세요 ({items.length}건 중 100건 표시)
          </p>
        )}
      </div>
    </div>
  );
}
