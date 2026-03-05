"use client";

import { CleanHouse, BIN_CONFIG } from "@/types";

interface BinIconsProps {
  item: CleanHouse;
  size?: "sm" | "md";
}

export function BinIcons({ item, size = "md" }: BinIconsProps) {
  const isSm = size === "sm";

  return (
    <div className={isSm ? "flex flex-wrap gap-1" : "bin-grid"}>
      {BIN_CONFIG.map(({ key, label, icon }) => {
        const count = item[key] as number;
        const isZero = count === 0;

        if (isSm) {
          if (isZero) return null;
          return (
            <span
              key={key}
              className="inline-flex items-center gap-0.5 text-xs bg-slate-100 rounded px-1.5 py-0.5"
            >
              <span className="text-[10px]">{icon}</span>
              <span className="font-medium text-slate-700">{count}</span>
            </span>
          );
        }

        return (
          <div
            key={key}
            className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs ${
              isZero
                ? "bg-slate-50 text-slate-300"
                : "bg-slate-50 text-slate-700"
            }`}
          >
            <span className={`text-sm ${isZero ? "grayscale opacity-40" : ""}`}>
              {icon}
            </span>
            <div className="flex flex-col leading-tight">
              <span
                className={`text-[10px] ${
                  isZero ? "text-slate-300" : "text-slate-400"
                }`}
              >
                {label}
              </span>
              <span className={`font-semibold ${isZero ? "text-slate-300" : "text-slate-800"}`}>
                {count}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
