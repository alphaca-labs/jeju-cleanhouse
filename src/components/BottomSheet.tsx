"use client";

import { CleanHouse } from "@/types";
import { SearchBar } from "./SearchBar";
import { LocationCard } from "./LocationCard";
import { useRef, useState, useCallback, useEffect } from "react";

type SnapPoint = "closed" | "half" | "full";

interface BottomSheetProps {
  items: CleanHouse[];
  query: string;
  onQueryChange: (q: string) => void;
  districts: string[];
  selectedDistrict: string;
  onDistrictChange: (d: string) => void;
  selectedItem: CleanHouse | null;
  onSelectItem: (item: CleanHouse) => void;
  snapPoint: SnapPoint;
  onSnapChange: (s: SnapPoint) => void;
}

const SNAP_HEIGHTS: Record<SnapPoint, string> = {
  closed: "h-16",
  half: "h-[45vh]",
  full: "h-[85vh]",
};

export function BottomSheet({
  items,
  query,
  onQueryChange,
  districts,
  selectedDistrict,
  onDistrictChange,
  selectedItem,
  onSelectItem,
  snapPoint,
  onSnapChange,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const [dragging, setDragging] = useState(false);

  const handleDragStart = useCallback((y: number) => {
    dragStartY.current = y;
    setDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    (y: number) => {
      const diff = y - dragStartY.current;
      setDragging(false);

      if (diff > 50) {
        // Dragged down
        if (snapPoint === "full") onSnapChange("half");
        else onSnapChange("closed");
      } else if (diff < -50) {
        // Dragged up
        if (snapPoint === "closed") onSnapChange("half");
        else onSnapChange("full");
      }
    },
    [snapPoint, onSnapChange]
  );

  return (
    <div
      ref={sheetRef}
      className={`md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-all duration-300 z-50 ${
        SNAP_HEIGHTS[snapPoint]
      } ${dragging ? "transition-none" : ""}`}
    >
      {/* Drag handle */}
      <div
        className="flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing touch-none"
        onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
        onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientY)}
        onMouseDown={(e) => handleDragStart(e.clientY)}
        onMouseUp={(e) => handleDragEnd(e.clientY)}
        onClick={() => {
          if (snapPoint === "closed") onSnapChange("half");
          else if (snapPoint === "half") onSnapChange("full");
        }}
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full" />
      </div>

      {/* Header row (always visible) */}
      <div className="px-4 pb-2 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">
          🏝️ 클린하우스 <span className="text-gray-400 font-normal">{items.length}건</span>
        </h2>
        {snapPoint !== "closed" && (
          <button
            onClick={() => onSnapChange("closed")}
            className="text-gray-400 text-xs"
          >
            닫기
          </button>
        )}
      </div>

      {/* Content (hidden when closed) */}
      {snapPoint !== "closed" && (
        <div className="px-4 pb-2 flex flex-col h-[calc(100%-60px)]">
          <SearchBar
            query={query}
            onQueryChange={onQueryChange}
            districts={districts}
            selectedDistrict={selectedDistrict}
            onDistrictChange={onDistrictChange}
            resultCount={items.length}
          />
          <div className="flex-1 overflow-y-auto mt-2 space-y-2 pb-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <span className="text-3xl mb-2">🔍</span>
                <p className="text-sm">검색 결과가 없습니다</p>
              </div>
            ) : (
              items.slice(0, 50).map((item, i) => (
                <LocationCard
                  key={`${item.lat}-${item.lng}-${i}`}
                  item={item}
                  isSelected={
                    selectedItem?.lat === item.lat &&
                    selectedItem?.lng === item.lng
                  }
                  onClick={() => {
                    onSelectItem(item);
                    onSnapChange("closed");
                  }}
                />
              ))
            )}
            {items.length > 50 && (
              <p className="text-center text-xs text-gray-400 py-2">
                검색으로 범위를 좁혀보세요
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
