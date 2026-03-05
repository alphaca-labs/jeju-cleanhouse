"use client";

import { useCallback, useMemo, useState } from "react";
import { Header } from "./Header";
import { SidePanel } from "./SidePanel";
import { BottomSheet } from "./BottomSheet";
import { MapView } from "./MapView";
import { Toast } from "./Toast";
import type { CleanHouse } from "@/types";

interface JejuCleanHouseProps {
  items: CleanHouse[];
}

const JEJU_CENTER = { lat: 33.3846216, lng: 126.5534925 };

export function JejuCleanHouse({ items }: JejuCleanHouseProps) {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<CleanHouse | null>(null);
  const [center, setCenter] = useState(JEJU_CENTER);
  const [toastVisible, setToastVisible] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const districts = useMemo(() => {
    const set = new Set(items.map((item) => item.district).filter(Boolean));
    return Array.from(set).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = items;

    if (selectedDistrict) {
      result = result.filter((item) => item.district === selectedDistrict);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.address.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.district.toLowerCase().includes(q)
      );
    }

    return result;
  }, [items, search, selectedDistrict]);

  const handleCopy = useCallback(() => {
    setToastVisible(true);
  }, []);

  const handleToastClose = useCallback(() => {
    setToastVisible(false);
  }, []);

  const handleSelect = useCallback((item: CleanHouse | null) => {
    setSelectedItem(item);
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop side panel */}
        <SidePanel
          items={filteredItems}
          allItems={items}
          search={search}
          onSearchChange={setSearch}
          selectedItem={selectedItem}
          onSelect={handleSelect}
          districts={districts}
          selectedDistrict={selectedDistrict}
          onDistrictChange={setSelectedDistrict}
        />

        {/* Map */}
        <MapView
          items={filteredItems}
          selectedItem={selectedItem}
          onSelect={handleSelect}
          onCopy={handleCopy}
          center={center}
          onCenterChange={setCenter}
        />
      </div>

      {/* Mobile bottom sheet */}
      <BottomSheet
        items={filteredItems}
        search={search}
        onSearchChange={setSearch}
        selectedItem={selectedItem}
        onSelect={handleSelect}
        districts={districts}
        selectedDistrict={selectedDistrict}
        onDistrictChange={setSelectedDistrict}
      />

      <Toast
        message="복사되었습니다 ✓"
        visible={toastVisible}
        onClose={handleToastClose}
      />
    </div>
  );
}
