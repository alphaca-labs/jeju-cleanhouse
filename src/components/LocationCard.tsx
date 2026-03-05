"use client";

import { CleanHouse } from "@/types";
import { BinIcons } from "./BinIcons";

interface LocationCardProps {
  item: CleanHouse;
  isSelected: boolean;
  onSelect: (item: CleanHouse) => void;
}

export function LocationCard({ item, isSelected, onSelect }: LocationCardProps) {
  return (
    <button
      onClick={() => onSelect(item)}
      className={`w-full text-left px-4 py-3 transition-colors ${
        isSelected
          ? "bg-primary-50 border-l-2 border-primary-500"
          : "hover:bg-slate-50 border-l-2 border-transparent"
      }`}
    >
      <p className="font-semibold text-sm text-slate-900 truncate">
        {item.name}
      </p>
      <p className="text-xs text-slate-500 mt-0.5 truncate">{item.address}</p>
      <div className="mt-2">
        <BinIcons item={item} size="sm" />
      </div>
    </button>
  );
}
