import { apiFetch } from "@/lib/api";
import SalesForm from "./sales-form";

type Customer = {
  id: number;
  name: string;
  note?: string | null;
  status: string;
};

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

type SaleItem = {
  id: number;
  product_id: number;
  product_name_snapshot: string;
  qty: number;
  unit_price: number;
  subtotal: number;
};

type Sale = {
  id: number;
  customer_id?: number | null;
  customer_name_snapshot: string;
  total_amount: number;
  received_amount: number;
  status: string;
  note?: string | null;
  items: SaleItem[];
};

async function getCustomers(): Promise<Customer[]> {
  return apiFetch<Customer[]>("/customers?status=active");
}

async function getProducts(): Promise<Product[]> {
  return apiFetch<Product[]>("/products?status=active");
}

async function getSales(): Promise<Sale[]> {
  return apiFetch<Sale[]>("/sales");
}

export default async function SalesPage() {
  const [customers, products, sales] = await Promise.all([
    getCustomers(),
    getProducts(),
    getSales(),
  ]);

  return <SalesForm customers={customers} products={products} sales={sales} />;
}