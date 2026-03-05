"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface BottomSheetProps {
  children: React.ReactNode;
}

const SNAP_CLOSED = 72;
const SNAP_HALF = 50; // percentage of viewport
const SNAP_FULL = 90; // percentage of viewport

export function BottomSheet({ children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    isDragging: false,
    startY: 0,
    startHeight: 0,
  });
  const [height, setHeight] = useState(SNAP_CLOSED);
  const [isPercentage, setIsPercentage] = useState(false);

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

  const handleDragStart = useCallback(
    (clientY: number) => {
      const currentHeight = sheetRef.current?.offsetHeight ?? SNAP_CLOSED;
      dragRef.current = {
        isDragging: true,
        startY: clientY,
        startHeight: currentHeight,
      };
    },
    []
  );

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

  return (
    <div
      ref={sheetRef}
      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-40 transition-[height] duration-300 ease-out flex flex-col md:hidden"
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
      {!isPercentage && height <= SNAP_CLOSED && (
        <div className="px-4 pb-2">
          <p className="text-sm font-medium text-slate-700">
            클린하우스 목록 보기
          </p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">{children}</div>
    </div>
  );
}
