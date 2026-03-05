"use client";

import { CleanHouse } from "@/types";

const bins = [
  { key: "trashBins" as const, icon: "🗑️", label: "종량제" },
  { key: "recycleBins" as const, icon: "♻️", label: "재활용" },
  { key: "glassBins" as const, icon: "🍶", label: "유리병" },
  { key: "styrofoamBins" as const, icon: "📦", label: "스티로폼" },
  { key: "batteryBins" as const, icon: "🔋", label: "폐건전지" },
  { key: "fluorescentBins" as const, icon: "💡", label: "폐형광등" },
  { key: "foodWasteBins" as const, icon: "🍽️", label: "음식물" },
  { key: "foodWeighBins" as const, icon: "⚖️", label: "계량" },
  { key: "cctvCount" as const, icon: "📹", label: "CCTV" },
] as const;

type BinKey = (typeof bins)[number]["key"];

export function BinIcons({
  item,
  compact = false,
}: {
  item: CleanHouse;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {bins.map((b) => {
          const val = item[b.key as BinKey] ?? 0;
          if (val <= 0) return null;
          return (
            <span
              key={b.key}
              className="inline-flex items-center text-xs bg-slate-100 rounded px-1 py-0.5"
              title={`${b.label}: ${val}`}
            >
              <span className="text-[10px]">{b.icon}</span>
              <span className="ml-0.5 text-slate-600">{val}</span>
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {bins.map((b) => {
        const val = item[b.key as BinKey] ?? 0;
        const active = val > 0;
        return (
          <div
            key={b.key}
            className={`flex items-center gap-1 text-xs rounded-md px-2 py-1 ${
              active
                ? "bg-blue-50 text-blue-800"
                : "bg-gray-50 text-gray-400"
            }`}
            title={b.label}
          >
            <span className="text-sm">{b.icon}</span>
            <span className="font-medium">{val}</span>
          </div>
        );
      })}
    </div>
  );
}
