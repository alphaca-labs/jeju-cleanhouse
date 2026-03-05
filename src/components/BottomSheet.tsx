"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CleanHouse } from "@/types";
import { SearchBar } from "./SearchBar";
import { LocationCard } from "./LocationCard";
import { MapPin } from "lucide-react";

interface BottomSheetProps {
  items: CleanHouse[];
  search: string;
  onSearchChange: (value: string) => void;
  selectedItem: CleanHouse | null;
  onSelect: (item: CleanHouse) => void;
  districts: string[];
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
}

const SNAP_CLOSED = 72;
const SNAP_HALF = 50;
const SNAP_FULL = 90;

export function BottomSheet({
  items,
  search,
  onSearchChange,
  selectedItem,
  onSelect,
  districts,
  selectedDistrict,
  onDistrictChange,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    isDragging: false,
    startY: 0,
    startHeight: 0,
  });
  const [height, setHeight] = useState(SNAP_CLOSED);
  const [isPercentage, setIsPercentage] = useState(false);
  const [dragging, setDragging] = useState(false);

  const snapTo = useCallback((target: "closed" | "half" | "full") => {
    if (target === "closed") {
      setIsPercentage(false);
      setHeight(SNAP_CLOSED);
    } else if (target === "half") {
      setIsPercentage(true);
      setHeight(SNAP_HALF);
    } else {
      setIsPercentage(true);
      setHeight(SNAP_FULL);
    }
  }, []);

  const handleDragStart = useCallback((clientY: number) => {
    const currentHeight = sheetRef.current?.offsetHeight ?? SNAP_CLOSED;
    dragRef.current = {
      isDragging: true,
      startY: clientY,
      startHeight: currentHeight,
    };
    setDragging(true);
  }, []);

  const handleDragMove = useCallback((clientY: number) => {
    if (!dragRef.current.isDragging) return;
    const delta = dragRef.current.startY - clientY;
    const newHeight = Math.max(
      SNAP_CLOSED,
      Math.min(window.innerHeight * 0.9, dragRef.current.startHeight + delta)
    );
    setIsPercentage(false);
    setHeight(newHeight);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;
    setDragging(false);

    const currentHeight = sheetRef.current?.offsetHeight ?? SNAP_CLOSED;
    const vh = window.innerHeight;
    const ratio = currentHeight / vh;

    if (ratio < 0.25) {
      snapTo("closed");
    } else if (ratio < 0.7) {
      snapTo("half");
    } else {
      snapTo("full");
    }
  }, [snapTo]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleDragMove(e.clientY);
    const handleMouseUp = () => handleDragEnd();
    const handleTouchMove = (e: TouchEvent) =>
      handleDragMove(e.touches[0].clientY);
    const handleTouchEnd = () => handleDragEnd();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  const heightStyle = isPercentage ? `${height}vh` : `${height}px`;
  const isClosed = !isPercentage && height <= SNAP_CLOSED;

  return (
    <div
      ref={sheetRef}
      className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-40 flex flex-col md:hidden ${
        dragging ? "" : "bottom-sheet-transition"
      }`}
      style={{ height: heightStyle }}
    >
      {/* Drag handle */}
      <div
        className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing shrink-0"
        onMouseDown={(e) => handleDragStart(e.clientY)}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
        onClick={() => {
          if (!dragRef.current.isDragging) {
            const currentHeight = sheetRef.current?.offsetHeight ?? SNAP_CLOSED;
            const vh = window.innerHeight;
            const ratio = currentHeight / vh;
            if (ratio < 0.25) snapTo("half");
            else if (ratio < 0.7) snapTo("full");
            else snapTo("closed");
          }
        }}
      >
        <div className="bottom-sheet-handle" />
      </div>

      {/* Peek label when closed */}
      {isClosed && (
        <div className="px-4 pb-2">
          <p className="text-sm font-medium text-slate-700">
            클린하우스 목록 ({items.length.toLocaleString()}건)
          </p>
        </div>
      )}

      {/* Content when open */}
      {!isClosed && (
        <>
          <SearchBar
            value={search}
            onChange={onSearchChange}
            resultCount={items.length}
          />
          <div className="px-4 py-2 border-b border-slate-100 shrink-0">
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
        </>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
        {!isClosed && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <MapPin size={28} className="mb-2 text-slate-300" />
            <p className="text-sm font-medium">검색 결과가 없습니다</p>
            <p className="text-xs mt-1">다른 검색어를 입력해보세요</p>
          </div>
        ) : (
          !isClosed &&
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
    </div>
  );
}
