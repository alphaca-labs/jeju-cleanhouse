"use client";

import { MarkerClusterer } from "@googlemaps/markerclusterer";
import {
  GoogleMap,
  OverlayViewF,
  OverlayView,
  useLoadScript,
} from "@react-google-maps/api";
import { Copy, Locate, Navigation, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import type { CleanHouse } from "@/types";
import { BinIcons } from "./BinIcons";

interface MapViewProps {
  items: CleanHouse[];
  selectedItem: CleanHouse | null;
  onSelect: (item: CleanHouse | null) => void;
  onCopy: () => void;
  center: { lat: number; lng: number };
  onCenterChange: (center: { lat: number; lng: number }) => void;
}

function getMapOptions(): google.maps.MapOptions {
  return {
    disableDefaultUI: true,
    zoomControl: true,
    clickableIcons: false,
    styles: [
      {
        featureType: "poi",
        stylers: [{ visibility: "simplified" }],
      },
    ],
  };
}

export function MapView({
  items,
  selectedItem,
  onSelect,
  onCopy,
  center,
  onCenterChange,
}: MapViewProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const legacyMarkersRef = useRef<google.maps.Marker[]>([]);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const [locating, setLocating] = useState(false);

  const createMarkers = useCallback(
    (map: google.maps.Map, data: CleanHouse[]) => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
      }
      legacyMarkersRef.current.forEach((m) => m.setMap(null));
      legacyMarkersRef.current = [];

      const markers = data.map((item) => {
        const marker = new google.maps.Marker({
          position: { lat: Number(item.lat), lng: Number(item.lng) },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: "#2563EB",
            fillOpacity: 0.9,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            scale: 7,
          },
        });

        marker.addListener("click", () => {
          onSelectRef.current(item);
          map.panTo({ lat: Number(item.lat), lng: Number(item.lng) });
        });

        return marker;
      });

      legacyMarkersRef.current = markers;

      const renderer = {
        render: ({
          count,
          position,
        }: {
          count: number;
          position: google.maps.LatLng;
        }) => {
          const size = Math.min(50, 28 + Math.log2(count) * 4);
          return new google.maps.Marker({
            position,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: "#2563EB",
              fillOpacity: 0.8,
              strokeColor: "#ffffff",
              strokeWeight: 2.5,
              scale: size / 2,
            },
            label: {
              text:
                count > 999
                  ? `${Math.round(count / 1000)}k`
                  : String(count),
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: "600",
            },
            zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
          });
        },
      };

      clustererRef.current = new MarkerClusterer({
        map,
        markers,
        renderer,
      });
    },
    []
  );

  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      createMarkers(map, items);
    },
    [items, createMarkers]
  );

  useEffect(() => {
    if (mapRef.current) {
      createMarkers(mapRef.current, items);
    }
  }, [items, createMarkers]);

  useEffect(() => {
    if (selectedItem && mapRef.current) {
      mapRef.current.panTo({
        lat: Number(selectedItem.lat),
        lng: Number(selectedItem.lng),
      });
      if (mapRef.current.getZoom()! < 15) {
        mapRef.current.setZoom(15);
      }
    }
  }, [selectedItem]);

  const handleLocate = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCenter = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        onCenterChange(newCenter);
        mapRef.current?.panTo(newCenter);
        mapRef.current?.setZoom(14);
        setLocating(false);
      },
      () => {
        setLocating(false);
      }
    );
  };

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">지도 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1">
      <GoogleMap
        mapContainerClassName="h-full w-full"
        center={center}
        zoom={11}
        onLoad={onMapLoad}
        options={getMapOptions()}
        onClick={() => onSelect(null)}
      >
        {selectedItem && (
          <OverlayViewF
            position={{
              lat: Number(selectedItem.lat),
              lng: Number(selectedItem.lng),
            }}
            mapPaneName={OverlayView.FLOAT_PANE}
            getPixelPositionOffset={(width, height) => ({
              x: -(width / 2),
              y: -(height + 16),
            })}
          >
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 w-80 overflow-hidden">
              <div className="p-4">
                {/* Header: Name + Close */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-slate-900 break-keep">
                      {selectedItem.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 break-keep">
                      {selectedItem.address}
                    </p>
                  </div>
                  <button
                    onClick={() => onSelect(null)}
                    className="text-slate-400 hover:text-slate-600 shrink-0 p-0.5"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Bin info grid */}
                <div className="mt-3">
                  <BinIcons item={selectedItem} size="md" />
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-3">
                  <CopyToClipboard
                    text={selectedItem.address}
                    onCopy={onCopy}
                  >
                    <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                      <Copy size={13} />
                      주소 복사
                    </button>
                  </CopyToClipboard>
                  <a
                    href={`https://map.kakao.com/link/to/${encodeURIComponent(selectedItem.name)},${selectedItem.lat},${selectedItem.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-[#3C1E1E] bg-[#FEE500] hover:bg-[#F5DC00] rounded-lg transition-colors"
                  >
                    <Navigation size={13} />
                    카카오내비
                  </a>
                </div>
              </div>
              {/* Arrow */}
              <div className="flex justify-center -mb-2">
                <div className="w-3 h-3 bg-white border-r border-b border-slate-200 rotate-45 -translate-y-1.5" />
              </div>
            </div>
          </OverlayViewF>
        )}
      </GoogleMap>

      {/* FAB: Current location */}
      <button
        onClick={handleLocate}
        disabled={locating}
        className="absolute bottom-24 md:bottom-6 right-4 w-12 h-12 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:bg-slate-100 transition-colors z-10"
        aria-label="현재 위치"
      >
        {locating ? (
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Locate size={20} className="text-primary-500" />
        )}
      </button>
    </div>
  );
}
