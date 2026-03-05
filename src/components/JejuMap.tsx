"use client";

import {
  GoogleMap,
  MarkerF,
  useLoadScript,
  OverlayViewF,
} from "@react-google-maps/api";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import toast from 'react-hot-toast';

// Simple SVG icon components
const SearchIcon = (props: any) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const MapPinIcon = (props: any) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const CopyIcon = (props: any) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </svg>
);

const NavigationIcon = (props: any) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
  </svg>
);

const ExternalLinkIcon = (props: any) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15,3 21,3 21,9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

const XIcon = (props: any) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const LocateIcon = (props: any) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
  </svg>
);

const ChevronUpIcon = (props: any) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);

const ChevronDownIcon = (props: any) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const ListIcon = (props: any) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

type BinInfo = {
  general: number;
  recycle: number;
  glass: number;
  styrofoam: number;
  battery: number;
  fluorescent: number;
  food: number;
  foodScale: number;
};

export type CleanHouseItem = {
  district: string;
  address: string;
  name: string;
  lat: number;
  lng: number;
  bins: BinInfo;
  cctv: number;
  updatedAt: string;
};

const BIN_TYPES: { key: keyof BinInfo; icon: string; label: string }[] = [
  { key: "general", icon: "🗑️", label: "종량제" },
  { key: "recycle", icon: "♻️", label: "재활용" },
  { key: "glass", icon: "🍾", label: "유리병" },
  { key: "styrofoam", icon: "📦", label: "스티로폼" },
  { key: "battery", icon: "🔋", label: "건전지" },
  { key: "fluorescent", icon: "💡", label: "형광등" },
  { key: "food", icon: "🍽️", label: "음식물" },
  { key: "foodScale", icon: "⚖️", label: "음식물(계량)" },
];

export type JejuMapProps = {
  items: CleanHouseItem[];
};

const BinBadge = ({
  icon,
  label,
  count,
}: {
  icon: string;
  label: string;
  count: number;
}) => {
  if (count <= 0) return null;
  return (
    <div
      className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: "#f0f4ff",
        border: "1px solid #e0e7ff",
        whiteSpace: "nowrap",
      }}
      title={`${label} ${count}개`}
    >
      <span>{icon}</span>
      <span style={{ color: "#374151" }}>{count}</span>
    </div>
  );
};

// Map styling for clean/minimal look
const mapStyles = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.business",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
];

const JEJU_CENTER = { lat: 33.3846216, lng: 126.5534925 };

export const JejuMap = ({ items }: JejuMapProps) => {
  const mapRef = useRef<google.maps.Map>();
  const clustererRef = useRef<MarkerClusterer>();
  const userMarkerRef = useRef<google.maps.Marker>();

  const [selected, setSelected] = useState<CleanHouseItem | null>(null);
  const [center, setCenter] = useState(JEJU_CENTER);
  const [userLocation, setUserLocation] = useState<google.maps.LatLng | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    return items.filter(item =>
      item.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.district.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  // Calculate distance for sorting
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Sort items by distance from user location
  const sortedItems = useMemo(() => {
    if (!userLocation) return filteredItems;
    return [...filteredItems].sort((a, b) => {
      const distanceA = calculateDistance(userLocation.lat(), userLocation.lng(), a.lat, a.lng);
      const distanceB = calculateDistance(userLocation.lat(), userLocation.lng(), b.lat, b.lng);
      return distanceA - distanceB;
    });
  }, [filteredItems, userLocation, calculateDistance]);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;

    // Create custom marker icon
    const customIcon = {
      url: `data:image/svg+xml,${encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="#10B981"/>
          <circle cx="16" cy="16" r="12" fill="#10B981" stroke="white" stroke-width="2"/>
          <path d="M12 16l3 3 6-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `)}`,
      scaledSize: new google.maps.Size(32, 32),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(16, 16),
    };

    // Create markers for clustering
    const markers = filteredItems.map((item) => {
      const marker = new google.maps.Marker({
        position: { lat: item.lat, lng: item.lng },
        icon: customIcon,
        title: item.address,
      });

      marker.addListener('click', () => {
        setSelected(item);
        map.panTo({ lat: item.lat, lng: item.lng });
      });

      return marker;
    });

    // Initialize clusterer
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
    }

    clustererRef.current = new MarkerClusterer({
      map,
      markers,
      renderer: {
        render: ({ count, position }) => {
          return new google.maps.Marker({
            position,
            icon: {
              url: `data:image/svg+xml,${encodeURIComponent(`
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="20" fill="#0EA5E9"/>
                  <circle cx="24" cy="24" r="20" fill="#0EA5E9" stroke="white" stroke-width="4"/>
                  <text x="24" y="28" text-anchor="middle" fill="white" font-family="Pretendard" font-weight="600" font-size="14">${count}</text>
                </svg>
              `)}`,
              scaledSize: new google.maps.Size(48, 48),
              anchor: new google.maps.Point(24, 24),
            },
            label: {
              text: count.toString(),
              color: "transparent",
            },
            title: `${count}개 위치`,
            zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
          });
        },
      },
    });
  }, [filteredItems]);

  // Handle current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('위치 서비스를 사용할 수 없습니다');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = new google.maps.LatLng(
          position.coords.latitude,
          position.coords.longitude
        );
        setUserLocation(newLocation);
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });

        // Update or create user marker
        if (mapRef.current) {
          if (userMarkerRef.current) {
            userMarkerRef.current.setMap(null);
          }

          userMarkerRef.current = new google.maps.Marker({
            position: newLocation,
            map: mapRef.current,
            icon: {
              url: `data:image/svg+xml,${encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" fill="#0EA5E9"/>
                  <circle cx="12" cy="12" r="8" stroke="white" stroke-width="3"/>
                  <circle cx="12" cy="12" r="3" fill="white"/>
                </svg>
              `)}`,
              scaledSize: new google.maps.Size(24, 24),
              anchor: new google.maps.Point(12, 12),
            },
            title: '현재 위치',
            zIndex: 1000,
          });

          mapRef.current.panTo(newLocation);
          mapRef.current.setZoom(13);
        }

        setIsLocating(false);
        toast.success('현재 위치를 찾았습니다');
      },
      (error) => {
        setIsLocating(false);
        console.error('Geolocation error:', error);
        toast.error('위치를 찾을 수 없습니다');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  const handleItemClick = useCallback((item: CleanHouseItem) => {
    setSelected(item);
    if (mapRef.current) {
      mapRef.current.panTo({ lat: item.lat, lng: item.lng });
      mapRef.current.setZoom(15);
    }
    if (isMobile) {
      setIsBottomSheetExpanded(false);
    }
  }, [isMobile]);

  const copyAddress = useCallback((address: string) => {
    toast.success('주소가 복사되었습니다!');
  }, []);

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  if (!isLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">지도를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-50 md:left-80 md:right-4">
        <div className="bg-white/95 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="주소 또는 지역으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-none outline-none bg-transparent text-gray-800 placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 w-5 h-5"
              >
                <XIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="px-4 pb-2 text-sm text-gray-500">
              {filteredItems.length}개 결과
            </div>
          )}
        </div>
      </div>

      {/* Desktop Side Panel */}
      {!isMobile && (
        <div className={`absolute left-0 top-0 bottom-0 w-80 bg-white shadow-lg transform transition-transform duration-300 z-40 ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListIcon className="w-5 h-5 text-gray-600" />
                <h2 className="font-semibold text-gray-800">
                  클린하우스 목록 ({sortedItems.length})
                </h2>
              </div>
              <button
                onClick={() => setIsSidePanelOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sortedItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleItemClick(item)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selected === item ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                          {item.district}
                        </span>
                        {userLocation && (
                          <span className="text-xs text-gray-500">
                            {formatDistance(
                              calculateDistance(
                                userLocation.lat(),
                                userLocation.lng(),
                                item.lat,
                                item.lng
                              )
                            )}
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-gray-800 mb-1">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.address}</p>
                    </div>
                    <MapPinIcon className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0 ml-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Sheet */}
      {isMobile && (
        <>
          {/* Toggle Button */}
          <div className="absolute bottom-20 left-4 z-50">
            <button
              onClick={() => setIsBottomSheetExpanded(!isBottomSheetExpanded)}
              className="bg-white shadow-lg rounded-xl px-4 py-3 flex items-center gap-2 border border-gray-200"
            >
              <ListIcon className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-800">
                목록 ({sortedItems.length})
              </span>
              {isBottomSheetExpanded ? (
                <ChevronDownIcon className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronUpIcon className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>

          {/* Bottom Sheet */}
          <div className={`absolute bottom-0 left-0 right-0 bg-white shadow-lg transform transition-transform duration-300 z-40 rounded-t-xl ${
            isBottomSheetExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-120px)]'
          }`}>
            <div className="h-96 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800">
                    클린하우스 목록 ({sortedItems.length})
                  </h2>
                  <button
                    onClick={() => setIsBottomSheetExpanded(!isBottomSheetExpanded)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {isBottomSheetExpanded ? (
                      <ChevronDownIcon className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronUpIcon className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {sortedItems.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleItemClick(item)}
                    className={`p-4 border-b border-gray-100 cursor-pointer active:bg-gray-50 transition-colors ${
                      selected === item ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                            {item.district}
                          </span>
                          {userLocation && (
                            <span className="text-xs text-gray-500">
                              {formatDistance(
                                calculateDistance(
                                  userLocation.lat(),
                                  userLocation.lng(),
                                  item.lat,
                                  item.lng
                                )
                              )}
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-gray-800 mb-1">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.address}</p>
                      </div>
                      <MapPinIcon className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0 ml-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Side Panel Toggle Button (Desktop) */}
      {!isMobile && !isSidePanelOpen && (
        <div className="absolute top-20 left-4 z-50">
          <button
            onClick={() => setIsSidePanelOpen(true)}
            className="bg-white shadow-lg rounded-xl p-3 hover:shadow-xl transition-shadow border border-gray-200"
          >
            <ListIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}

      {/* Current Location Button */}
      <div className="absolute bottom-4 right-4 z-50">
        <button
          onClick={getCurrentLocation}
          disabled={isLocating}
          className={`bg-white shadow-lg rounded-xl p-3 hover:shadow-xl transition-all border border-gray-200 ${
            isLocating ? 'animate-pulse' : ''
          }`}
        >
          <LocateIcon className={`w-6 h-6 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Google Map */}
      <GoogleMap
        mapContainerClassName="h-full w-full"
        center={center}
        zoom={11}
        onLoad={onLoad}
        options={{
          styles: mapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {/* Custom Info Card */}
        {selected && (
          <OverlayViewF
            position={{ lat: selected.lat, lng: selected.lng }}
            mapPaneName="overlayMouseTarget"
          >
            <div className="absolute transform -translate-x-1/2 -translate-y-full mb-2">
              <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4 min-w-[300px] max-w-[400px]">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPinIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                        {selected.district}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{selected.name}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      {selected.address}
                    </p>

                    {/* 수거함 정보 */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {BIN_TYPES.map(({ key, icon, label }) => (
                        <BinBadge
                          key={key}
                          icon={icon}
                          label={label}
                          count={selected.bins[key]}
                        />
                      ))}
                    </div>

                    {/* CCTV + 업데이트 */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      {selected.cctv > 0 && <span>📹 CCTV {selected.cctv}대</span>}
                      {selected.updatedAt && <span>{selected.updatedAt} 기준</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  >
                    <XIcon className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <CopyToClipboard text={selected.address} onCopy={() => copyAddress(selected.address)}>
                    <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      <CopyIcon className="w-4 h-4" />
                      주소복사
                    </button>
                  </CopyToClipboard>

                  <a
                    href={`https://map.kakao.com/link/to/${selected.address},${selected.lat},${selected.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 text-gray-800 px-3 py-2 rounded-lg hover:bg-yellow-500 transition-colors text-sm font-medium"
                  >
                    <NavigationIcon className="w-4 h-4" />
                    카카오내비
                  </a>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <ExternalLinkIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>
              {/* Arrow */}
              <div className="absolute left-1/2 transform -translate-x-1/2 top-full">
                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-white"></div>
                <div className="absolute w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-gray-200 -top-[9px] left-1/2 transform -translate-x-1/2"></div>
              </div>
            </div>
          </OverlayViewF>
        )}
      </GoogleMap>
    </div>
  );
};