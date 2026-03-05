"use client";

import { CleanHouse } from "@/types";
import { BinIcons } from "./BinIcons";

interface LocationCardProps {
  item: CleanHouse;
  isSelected?: boolean;
  onClick: () => void;
}

export function LocationCard({ item, isSelected, onClick }: LocationCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all hover:shadow-sm ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-sm"
          : "border-gray-100 bg-white hover:border-gray-200"
      }`}
    >
      <p className="font-semibold text-sm text-gray-900 truncate">
        {item.name}
      </p>
      <p className="text-xs text-gray-500 mt-0.5 truncate">{item.address}</p>
      <div className="mt-2">
        <BinIcons item={item} compact />
      </div>
    </button>
  );
}
