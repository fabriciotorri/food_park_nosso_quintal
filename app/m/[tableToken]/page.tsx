import { notFound } from "next/navigation";
import { FoodParkMenu } from "../../ui/food-park-menu";
import { foodParkTables } from "../../ui/menu-data";

type TablePageProps = {
  params: Promise<{ tableToken: string }>;
};

export default async function TableMenuPage({ params }: TablePageProps) {
  const { tableToken } = await params;
  const table = foodParkTables.find((entry) => entry.token === tableToken);

  if (!table || !table.active) notFound();

  return <FoodParkMenu tableNumber={table.number} />;
}
