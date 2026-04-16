import { apiFetch } from "@/lib/api";
import LogsClient from "./logs-client";

type LogItem = {
  id: number;
  object_type: string;
  object_id: number;
  action: string;
  detail: string;
  operator: string;
  time: string;
};

async function getLogs(): Promise<LogItem[]> {
  return apiFetch<LogItem[]>("/logs");
}

export default async function LogsPage() {
  const logs = await getLogs();

  return <LogsClient initialLogs={logs} />;
}