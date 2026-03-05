"use client";

import {
  GoogleMap,
  InfoWindowF,
  MarkerF,
  useLoadScript,
} from "@react-google-maps/api";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { CleanHouse } from "@/types";
import { BinIcons } from "./BinIcons";

interface MapViewProps {
  items: CleanHouse[];
  selected: CleanHouse | null;
  onSelect: (item: CleanHouse | null) => void;
  onCopy: () => void;
  center: { lat: number; lng: number };
  onCenterChange: (c: { lat: number; lng: number }) => void;
}

export function MapView({
  items,
  selected,
  onSelect,
  onCopy,
  center,
  onCenterChange,
}: MapViewProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Manage markers + clustering
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;
    const map = mapRef.current;

    // Clear old
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
    }
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Create markers
    const markers = items.map((item) => {
      const marker = new google.maps.Marker({
        position: { lat: item.lat, lng: item.lng },
        title: item.name,
      });
      marker.addListener("click", () => {
        onSelect(item);
        map.panTo({ lat: item.lat, lng: item.lng });
      });
      return marker;
    });
    markersRef.current = markers;

    // Cluster
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current.addMarkers(markers);
    } else {
      clustererRef.current = new MarkerClusterer({
        map,
        markers,
      });
    }

    return () => {
      markers.forEach((m) => {
        google.maps.event.clearInstanceListeners(m);
      });
    };
  }, [items, isLoaded, onSelect]);

  const goToMyLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        onCenterChange(loc);
        mapRef.current?.panTo(loc);
        mapRef.current?.setZoom(15);
      },
      () => alert("위치 정보를 가져올 수 없습니다")
    );
  };

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">지도 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      <GoogleMap
        onLoad={onMapLoad}
        mapContainerClassName="h-full w-full"
        center={center}
        zoom={11}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
          },
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
        onClick={() => onSelect(null)}
      >
        {/* InfoWindow */}
        {selected && (
          <InfoWindowF
            onCloseClick={() => onSelect(null)}
            position={{ lat: selected.lat, lng: selected.lng }}
            options={{ maxWidth: 320 }}
          >
            <div className="p-1 min-w-[260px]">
              <h3 className="font-bold text-base text-gray-900 mb-1">
                {selected.name}
              </h3>
              <p className="text-xs text-gray-500 mb-1">{selected.district}</p>
              <p className="text-sm text-gray-700 mb-3">{selected.address}</p>

              <BinIcons item={selected} />

              <div className="flex gap-2 mt-3">
                <CopyToClipboard text={selected.address} onCopy={onCopy}>
                  <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors min-h-[44px]">
                    📋 주소 복사
                  </button>
                </CopyToClipboard>
                <Link
                  href={`https://map.kakao.com/link/to/${selected.name},${selected.lat},${selected.lng}`}
                  target="_blank"
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#FEE500] hover:bg-[#FDD835] text-gray-900 rounded-lg text-xs font-medium transition-colors min-h-[44px]"
                >
                  🧭 카카오내비
                </Link>
              </div>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>

      {/* My Location FAB */}
      <button
        onClick={goToMyLocation}
        className="absolute bottom-24 md:bottom-6 right-4 w-12 h-12 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center text-xl transition-all active:scale-95 z-10"
        title="현재 위치"
      >
        📍
      </button>
    </div>
  );
}
