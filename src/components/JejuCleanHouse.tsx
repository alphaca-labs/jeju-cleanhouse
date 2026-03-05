"use client";

import { useCallback, useMemo, useState } from "react";
import { BottomSheet } from "./BottomSheet";
import { Header } from "./Header";
import { LocationList } from "./LocationList";
import { MapView } from "./MapView";
import { SearchBar } from "./SearchBar";
import { Toast } from "./Toast";
import type { CleanHouse } from "./types";

interface JejuCleanHouseProps {
  items: CleanHouse[];
}

const JEJU_CENTER = { lat: 33.3846216, lng: 126.5534925 };

export function JejuCleanHouse({ items }: JejuCleanHouseProps) {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<CleanHouse | null>(null);
  const [center, setCenter] = useState(JEJU_CENTER);
  const [toastVisible, setToastVisible] = useState(false);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((item) => item.address.toLowerCase().includes(q));
  }, [items, search]);

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
        <div className="hidden md:flex md:w-96 flex-col border-r border-slate-200 bg-white">
          <SearchBar
            value={search}
            onChange={setSearch}
            resultCount={filteredItems.length}
          />
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <LocationList
              items={filteredItems}
              selectedItem={selectedItem}
              onSelect={handleSelect}
              onCopy={handleCopy}
            />
          </div>
        </div>

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
      <div className="md:hidden">
        <BottomSheet>
          <SearchBar
            value={search}
            onChange={setSearch}
            resultCount={filteredItems.length}
          />
          <LocationList
            items={filteredItems}
            selectedItem={selectedItem}
            onSelect={handleSelect}
            onCopy={handleCopy}
          />
        </BottomSheet>
      </div>

      <Toast
        message="주소가 복사되었습니다"
        visible={toastVisible}
        onClose={handleToastClose}
      />
    </div>
  );
}
