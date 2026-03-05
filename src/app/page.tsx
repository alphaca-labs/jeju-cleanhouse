import { promises as fs } from "fs";
import path from "path";
import { CleanHouse } from "@/types";
import { ClientApp } from "@/components/ClientApp";

async function getData(): Promise<CleanHouse[]> {
  const dir = path.join(process.cwd(), "asset");
  const json = await fs.readFile(dir + "/data.json", "utf8");
  return JSON.parse(json);
}

export default async function Home() {
  const data = await getData();

  return <ClientApp items={data} />;
}
