import { apiFetch } from "@/lib/api";
import ProductManager from "./product-manager";

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
  return apiFetch<Product[]>("/products");
}

export default async function ProductsPage() {
  const products = await getProducts();

  return <ProductManager initialProducts={products} />;
}