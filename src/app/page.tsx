import { JejuMap, CleanHouseItem } from "@/components/JejuMap";
import { promises as fs } from "fs";
import path from "path";

async function getData(): Promise<CleanHouseItem[]> {
  const dir = path.join(process.cwd(), "asset");
  const json = await fs.readFile(dir + "/data.json", "utf8");
  const rawData = JSON.parse(json);

  // Transform and validate data
  return rawData.map((item: any) => ({
    name: item.name || "클린하우스",
    address: item.address || "",
    lat: parseFloat(item.lat) || 0,
    lng: parseFloat(item.lng) || 0,
  })).filter((item: CleanHouseItem) =>
    item.lat !== 0 && item.lng !== 0 && item.address.trim() !== ""
  );
}

export default async function Home() {
  const data = await getData();

  return (
    <main className="h-screen w-full bg-gray-50">
      <JejuMap items={data} />
    </main>
  );
}
