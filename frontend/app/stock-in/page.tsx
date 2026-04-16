import { apiFetch } from "@/lib/api";
import StockInForm from "./stock-in-form";

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

async function getProducts(): Promise<Product[]> {
  return apiFetch<Product[]>("/products?status=active");
}

export default async function StockInPage() {
  const products = await getProducts();
  return <StockInForm products={products} />;
}