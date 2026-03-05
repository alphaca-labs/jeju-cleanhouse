export interface CleanHouse {
  name: string;
  address: string;
  district: string;
  lat: number;
  lng: number;
  trashBins: number;
  recycleBins: number;
  glassBins: number;
  styrofoamBins: number;
  batteryBins: number;
  fluorescentBins: number;
  foodWasteBins: number;
  foodWeighBins: number;
  cctvCount: number;
}

export interface BinInfo {
  key: keyof CleanHouse;
  label: string;
  icon: string;
}

export const BIN_CONFIG: BinInfo[] = [
  { key: "trashBins", label: "종량제", icon: "🗑️" },
  { key: "recycleBins", label: "재활용", icon: "♻️" },
  { key: "glassBins", label: "유리병", icon: "🍶" },
  { key: "styrofoamBins", label: "스티로폼", icon: "📦" },
  { key: "batteryBins", label: "폐건전지", icon: "🔋" },
  { key: "fluorescentBins", label: "폐형광등", icon: "💡" },
  { key: "foodWasteBins", label: "음식물", icon: "🍽️" },
  { key: "foodWeighBins", label: "음식물계량", icon: "⚖️" },
  { key: "cctvCount", label: "CCTV", icon: "📹" },
];
