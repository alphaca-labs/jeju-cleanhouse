import { JejuCleanHouse } from "@/components/JejuCleanHouse";
import { promises as fs } from "fs";
import path from "path";

async function getData() {
  const dir = path.join(process.cwd(), "asset");
  const json = await fs.readFile(dir + "/data.json", "utf8");
  return JSON.parse(json);
}

export default async function Home() {
  const data = await getData();

  return <JejuCleanHouse items={data} />;
}
