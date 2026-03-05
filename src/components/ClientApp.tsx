"use client";

import { useState, useMemo, useCallback } from "react";
import { CleanHouse } from "@/types";
import { MapView } from "./MapView";
import { SidePanel } from "./SidePanel";
import { BottomSheet } from "./BottomSheet";
import { Toast } from "./Toast";

type SnapPoint = "closed" | "half" | "full";

export function ClientApp({ items }: { items: CleanHouse[] }) {
  const [query, setQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selected, setSelected] = useState<CleanHouse | null>(null);
  const [center, setCenter] = useState({ lat: 33.3846216, lng: 126.5534925 });
  const [showToast, setShowToast] = useState(false);
  const [snapPoint, setSnapPoint] = useState<SnapPoint>("closed");

  const districts = useMemo(() => {
    const set = new Set(items.map((i) => i.district));
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    let result = items;
    if (selectedDistrict) {
      result = result.filter((i) => i.district === selectedDistrict);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.address.toLowerCase().includes(q) ||
          i.district.toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, query, selectedDistrict]);

  const handleSelectItem = useCallback(
    (item: CleanHouse) => {
      setSelected(item);
      setCenter({ lat: item.lat, lng: item.lng });
    },
    []
  );

  const handleCopy = useCallback(() => {
    setShowToast(true);
  }, []);

  return (
    <main className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-slate-50">
      {/* Mobile header */}
      <div className="md:hidden bg-white border-b border-gray-100 px-4 py-3 z-20">
        <h1 className="text-base font-bold text-gray-900">
          🏝️ 제주 클린하우스
        </h1>
      </div>

      {/* Side Panel (PC) */}
      <SidePanel
        items={filtered}
        query={query}
        onQueryChange={setQuery}
        districts={districts}
        selectedDistrict={selectedDistrict}
        onDistrictChange={setSelectedDistrict}
        selectedItem={selected}
        onSelectItem={handleSelectItem}
      />

      {/* Map */}
      <MapView
        items={filtered}
        selected={selected}
        onSelect={setSelected}
        onCopy={handleCopy}
        center={center}
        onCenterChange={setCenter}
      />

      {/* Bottom Sheet (Mobile) */}
      <BottomSheet
        items={filtered}
        query={query}
        onQueryChange={setQuery}
        districts={districts}
        selectedDistrict={selectedDistrict}
        onDistrictChange={setSelectedDistrict}
        selectedItem={selected}
        onSelectItem={handleSelectItem}
        snapPoint={snapPoint}
        onSnapChange={setSnapPoint}
      />

      {/* Toast */}
      <Toast
        message="복사되었습니다 ✓"
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </main>
  );
}
