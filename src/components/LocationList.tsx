"use client";

import { Copy, MapPin, Navigation } from "lucide-react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import type { CleanHouse } from "./types";

interface LocationListProps {
  items: CleanHouse[];
  selectedItem: CleanHouse | null;
  onSelect: (item: CleanHouse) => void;
  onCopy: () => void;
}

export function LocationList({
  items,
  selectedItem,
  onSelect,
  onCopy,
}: LocationListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <MapPin size={24} className="text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-600">
          검색 결과가 없습니다
        </p>
        <p className="text-xs text-slate-400 mt-1">
          다른 키워드로 검색해 보세요
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {items.map((item, index) => {
        const isSelected =
          selectedItem?.lat === item.lat && selectedItem?.lng === item.lng;
        return (
          <div
            key={index}
            onClick={() => onSelect(item)}
            className={`px-4 py-3 cursor-pointer transition-colors hover:bg-slate-50 ${
              isSelected ? "bg-primary-50 border-l-2 border-l-primary-500" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  isSelected
                    ? "bg-primary-500 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <MapPin size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 leading-relaxed break-keep">
                  {item.address}
                </p>
                <div className="flex gap-1.5 mt-2">
                  <CopyToClipboard text={item.address} onCopy={onCopy}>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                    >
                      <Copy size={12} />
                      복사
                    </button>
                  </CopyToClipboard>
                  <a
                    href={`https://map.kakao.com/link/to/${item.address},${item.lat},${item.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-white bg-[#FEE500] text-[#3C1E1E] hover:bg-[#F5DC00] rounded-md transition-colors font-medium"
                  >
                    <Navigation size={12} />
                    카카오내비
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
