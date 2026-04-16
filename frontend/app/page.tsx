import { apiFetch } from "@/lib/api";

type Product = {
  id: number;
  name: string;
  status: string;
  current_stock: number;
};

type Customer = {
  id: number;
  name: string;
  status: string;
};

type Sale = {
  id: number;
  customer_name_snapshot: string;
  total_amount: number;
  status: string;
};

type LogItem = {
  id: number;
  object_type: string;
  object_id: number;
  action: string;
  detail: string;
  operator: string;
  time: string;
};

async function getProducts(): Promise<Product[]> {
  return apiFetch<Product[]>("/products");
}

async function getCustomers(): Promise<Customer[]> {
  return apiFetch<Customer[]>("/customers");
}

async function getSales(): Promise<Sale[]> {
  return apiFetch<Sale[]>("/sales");
}

async function getLogs(): Promise<LogItem[]> {
  return apiFetch<LogItem[]>("/logs");
}

function formatObjectType(value: string) {
  switch (value) {
    case "product":
      return "商品";
    case "sale":
      return "销售单";
    case "stock_in":
      return "入库";
    case "customer":
      return "客户";
    default:
      return value;
  }
}

function formatAction(value: string) {
  switch (value) {
    case "create":
      return "新增";
    case "update":
      return "编辑";
    case "deactivate":
      return "停用";
    case "void":
      return "作废";
    default:
      return value;
  }
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", { hour12: false });
}

export default async function HomePage() {
  const [products, customers, sales, logs] = await Promise.all([
    getProducts(),
    getCustomers(),
    getSales(),
    getLogs(),
  ]);

  const productCount = products.length;
  const activeProductCount = products.filter((p) => p.status === "active").length;
  const inStockProductCount = products.filter((p) => p.current_stock > 0).length;
  const customerCount = customers.length;
  const saleCount = sales.length;
  const recentLogs = logs.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">首页概览</h2>
        <p className="text-sm text-gray-600">
          查看当前系统的核心数据概况与最近操作记录。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">商品总数</div>
          <div className="mt-2 text-3xl font-semibold">{productCount}</div>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">启用商品</div>
          <div className="mt-2 text-3xl font-semibold">{activeProductCount}</div>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">有库存商品</div>
          <div className="mt-2 text-3xl font-semibold">{inStockProductCount}</div>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">客户总数</div>
          <div className="mt-2 text-3xl font-semibold">{customerCount}</div>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">销售单总数</div>
          <div className="mt-2 text-3xl font-semibold">{saleCount}</div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-medium">最近操作日志</h3>

        <div className="space-y-3">
          {recentLogs.length === 0 ? (
            <div className="rounded-md border px-4 py-6 text-center text-gray-500">
              暂无日志记录
            </div>
          ) : (
            recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col gap-2 rounded-md border px-4 py-4 md:flex-row md:items-start md:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                      {formatObjectType(log.object_type)}
                    </span>
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                      {formatAction(log.action)}
                    </span>
                    <span className="text-xs text-gray-500">
                      对象 ID：{log.object_id}
                    </span>
                  </div>

                  <div className="text-sm font-medium">{log.detail}</div>

                  <div className="text-xs text-gray-500">
                    操作人：{log.operator}
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  {formatTime(log.time)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}