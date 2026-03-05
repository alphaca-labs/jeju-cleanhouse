import { JejuMap, CleanHouseItem } from "@/components/JejuMap";
import { promises as fs } from "fs";
import path from "path";

async function getData(): Promise<CleanHouseItem[]> {
  const dir = path.join(process.cwd(), "asset");
  const json = await fs.readFile(dir + "/data.json", "utf8");
  const rawData = JSON.parse(json);

  // Transform and validate data - handle both old and new data format
  return rawData.map((item: any) => ({
    name: item.name || "클린하우스",
    address: item.address || "",
    lat: parseFloat(item.lat) || 0,
    lng: parseFloat(item.lng) || 0,
    district: item.district || extractDistrictFromAddress(item.address || ""),
    bins: item.bins || {
      general: 1,
      recycle: 1,
      glass: 0,
      styrofoam: 0,
      battery: 0,
      fluorescent: 0,
      food: 0,
      foodScale: 0,
    },
    cctv: item.cctv || 0,
    updatedAt: item.updatedAt || "2024-03",
  })).filter((item: CleanHouseItem) =>
    item.lat !== 0 && item.lng !== 0 && item.address.trim() !== ""
  );
}

function extractDistrictFromAddress(address: string): string {
  const parts = address.split(' ');
  if (parts.length >= 3) {
    return parts[2]; // Usually the district is the third part
  }
  if (parts.length >= 2) {
    return parts[1]; // Fallback to second part
  }
  return "제주특별자치도";
}

export default async function Home() {
  const data = await getData();

  return (
    <main className="h-screen w-full bg-gray-50">
      <JejuMap items={data} />
    </main>
  );
}
