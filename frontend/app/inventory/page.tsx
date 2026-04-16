import { apiFetch } from "@/lib/api";
import InventoryClient from "./inventory-client";

type Product = {
  id: number;
  name: string;
  spec?: string | null;
  unit: string;
  default_price: number;
  current_stock: number;
  status: string;
  note?: string | null;
};

async function getInventory(): Promise<Product[]> {
  return apiFetch<Product[]>("/inventory");
}

export default async function InventoryPage() {
  const products = await getInventory();

  return <InventoryClient initialProducts={products} />;
}