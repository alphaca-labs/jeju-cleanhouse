"use client";

import {
  GoogleMap,
  InfoWindowF,
  MarkerF,
  useLoadScript,
} from "@react-google-maps/api";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";

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

type CleanHouseItem = {
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

export const JejuMap = ({ items }: JejuMapProps) => {
  const map = useRef<any>();
  const [selected, setSelected] = useState<CleanHouseItem | null>(null);
  const [center, setCenter] = useState<any>({
    lat: 33.3846216,
    lng: 126.5534925,
  });
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(function (position) {
      console.log(position);
    });
  }, []);

  if (!isLoaded) return <div>loading</div>;

  return (
    <GoogleMap
      ref={map}
      mapContainerClassName="h-full w-full"
      center={center}
      zoom={11}
    >
      <div
        className="absolute flex flex-row inset-x-0 bottom-0 mx-auto h-16 items-center justify-center"
        onClick={() => {
          navigator.geolocation.getCurrentPosition((position) => {
            setCenter({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          });
        }}
      >
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-full">
          현재위치보기
        </button>
      </div>
      {items.map((item, index) => {
        return (
          <MarkerF
            key={index}
            position={{ lat: item.lat, lng: item.lng }}
            animation={google.maps.Animation.DROP}
            clickable={true}
            onClick={() => {
              setSelected(item);
            }}
          />
        );
      })}
      {selected && (
        <InfoWindowF
          onCloseClick={() => setSelected(null)}
          position={{
            lat: selected.lat,
            lng: selected.lng,
          }}
        >
          <div
            className="flex flex-col gap-3"
            style={{ padding: "8px", maxWidth: "320px", minWidth: "240px" }}
          >
            {/* 지역 + 단지명 */}
            <div>
              <p
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "2px",
                }}
              >
                {selected.district}
              </p>
              {selected.name && (
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#111827",
                    marginBottom: "2px",
                  }}
                >
                  {selected.name}
                </p>
              )}
              <p style={{ fontSize: "13px", color: "#374151" }}>
                {selected.address}
              </p>
            </div>

            {/* 수거함 정보 */}
            <div
              className="flex flex-wrap gap-1"
              style={{
                borderTop: "1px solid #e5e7eb",
                paddingTop: "8px",
              }}
            >
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
            <div
              className="flex items-center justify-between"
              style={{
                fontSize: "11px",
                color: "#9ca3af",
              }}
            >
              {selected.cctv > 0 && <span>📹 CCTV {selected.cctv}대</span>}
              {selected.updatedAt && <span>{selected.updatedAt} 기준</span>}
            </div>

            {/* 액션 버튼 */}
            <div
              className="flex items-center gap-2"
              style={{ borderTop: "1px solid #e5e7eb", paddingTop: "8px" }}
            >
              <CopyToClipboard text={selected.address} onCopy={() => {}}>
                <button
                  type="button"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center"
                >
                  주소 복사
                </button>
              </CopyToClipboard>
              <Link
                href={`https://map.kakao.com/link/to/${selected.address},${selected.lat},${selected.lng}`}
                target="_blank"
              >
                <img
                  src="btn_kakao_navi.png"
                  style={{ cursor: "pointer", height: "36px" }}
                />
              </Link>
            </div>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
};
