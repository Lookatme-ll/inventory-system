import { apiFetch } from "@/lib/api";
import CustomersClient from "./customers-client";

type Customer = {
  id: number;
  name: string;
  note?: string | null;
  status: string;
};

async function getCustomers(): Promise<Customer[]> {
  return apiFetch<Customer[]>("/customers");
}

export default async function CustomersPage() {
  const customers = await getCustomers();

  return <CustomersClient initialCustomers={customers} />;
}