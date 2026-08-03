import { FoodParkMenu } from "./ui/food-park-menu";

export default function Home() {
  // Página de demonstração. Na operação real, os clientes entram por /m/[token].
  return <FoodParkMenu tableNumber={12} />;
}
