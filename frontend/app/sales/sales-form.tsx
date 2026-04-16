"use client";
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";



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

type SaleItemForm = {
  productId: string;
  qty: string;
  unitPrice: string;
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

type Props = {
  customers: Customer[];
  products: Product[];
  sales: Sale[];
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export default function SalesForm({ customers, products, sales }: Props) {
  const [customerKeyword, setCustomerKeyword] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const router = useRouter();
  const [note, setNote] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("0");
  const [items, setItems] = useState<SaleItemForm[]>([
    { productId: "", qty: "1", unitPrice: "0" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expandedSaleId, setExpandedSaleId] = useState<number | null>(null);

  const matchedCustomers = useMemo(() => {
    if (!customerKeyword.trim()) return customers.slice(0, 5);
    return customers
      .filter((customer) => customer.name.includes(customerKeyword.trim()))
      .slice(0, 5);
  }, [customerKeyword, customers]);

  const itemRows = items.map((item) => {
    const product = products.find((p) => String(p.id) === item.productId);
    const qty = Number(item.qty || 0);
    const unitPrice = Number(item.unitPrice || 0);
    const subtotal = qty * unitPrice;

    return {
      ...item,
      product,
      subtotal,
    };
  });

  const totalAmount = itemRows.reduce((sum, item) => sum + item.subtotal, 0);

  function handleSelectCustomer(customer: Customer) {
    setSelectedCustomerId(String(customer.id));
    setCustomerKeyword(customer.name);
  }

  function handleCustomerInput(value: string) {
    setCustomerKeyword(value);
    setSelectedCustomerId("");
  }

  function handleAddItem() {
    setItems((prev) => [...prev, { productId: "", qty: "1", unitPrice: "0" }]);
  }

  function handleRemoveItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleChangeItem(index: number, field: keyof SaleItemForm, value: string) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const nextItem = { ...item, [field]: value };

        if (field === "productId") {
          const product = products.find((p) => String(p.id) === value);
          if (product) {
            nextItem.unitPrice = String(product.default_price ?? 0);
          }
        }

        return nextItem;
      })
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const payloadItems = items.map((item) => ({
        product_id: Number(item.productId),
        qty: Number(item.qty),
        unit_price: Number(item.unitPrice),
      }));

      const payload =
        selectedCustomerId !== ""
          ? {
              customer_id: Number(selectedCustomerId),
              received_amount: Number(receivedAmount),
              note: note || null,
              items: payloadItems,
            }
          : {
              customer_name: customerKeyword.trim(),
              received_amount: Number(receivedAmount),
              note: note || null,
              items: payloadItems,
            };

      const response = await fetch(`${API_BASE_URL}/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "创建销售单失败");
      }

      setSuccess("销售单创建成功");
      setCustomerKeyword("");
      setSelectedCustomerId("");
      setNote("");
      setReceivedAmount("0");
      setItems([{ productId: "", qty: "1", unitPrice: "0" }]);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "创建销售单失败";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVoidSale(saleId: number) {
    const confirmed = window.confirm("确认作废这张销售单吗？作废后会自动回补库存。");
    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/sales/${saleId}/void`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "作废销售单失败");
      }

      setSuccess("销售单已作废");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "作废销售单失败";
      setError(message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">销售开单</h2>
        <p className="text-sm text-gray-600">
          可选择已有客户，也可直接输入新客户名称。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-medium">客户信息</h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium">客户名称</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={customerKeyword}
              onChange={(e) => handleCustomerInput(e.target.value)}
              placeholder="输入客户名称，可直接输入新客户"
            />

            {customerKeyword !== "" && matchedCustomers.length > 0 ? (
              <div className="rounded-md border bg-white">
                {matchedCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => handleSelectCustomer(customer)}
                    className="block w-full border-b px-3 py-2 text-left text-sm last:border-b-0 hover:bg-gray-50"
                  >
                    {customer.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium">备注</label>
            <textarea
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="销售备注"
            />
          </div>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium">商品明细</h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            >
              添加商品
            </button>
          </div>

          <div className="space-y-4">
            {itemRows.map((item, index) => (
              <div key={index} className="grid grid-cols-1 gap-3 rounded-md border p-4 md:grid-cols-6">
                <div>
                  <label className="mb-1 block text-sm font-medium">商品</label>
                  <select
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={item.productId}
                    onChange={(e) => handleChangeItem(index, "productId", e.target.value)}
                  >
                    <option value="">请选择商品</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">当前库存</label>
                  <div className="rounded-md border bg-gray-50 px-3 py-2 text-sm">
                    {item.product ? `${item.product.current_stock} ${item.product.unit}` : "-"}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">数量</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={item.qty}
                    onChange={(e) => handleChangeItem(index, "qty", e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">单价</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={item.unitPrice}
                    onChange={(e) => handleChangeItem(index, "unitPrice", e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">小计</label>
                  <div className="rounded-md border bg-gray-50 px-3 py-2 text-sm">
                    {item.subtotal}
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length === 1}
                    className="rounded-md border border-red-300 px-3 py-2 text-sm text-red-600 disabled:opacity-40"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-medium">金额信息</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">总金额</label>
              <div className="rounded-md border bg-gray-50 px-3 py-2 text-sm">
                {totalAmount}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">实收金额</label>
              <input
                type="number"
                min="0"
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={receivedAmount}
                onChange={(e) => setReceivedAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {submitting ? "提交中..." : "提交销售单"}
            </button>

            {success ? <span className="text-sm text-green-600">{success}</span> : null}
            {error ? <span className="text-sm text-red-600">{error}</span> : null}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-medium">销售记录</h3>

          <div className="space-y-3">
            {sales.length === 0 ? (
              <div className="text-sm text-gray-500">暂无销售记录</div>
            ) : (
              sales.map((sale) => (
                <div key={sale.id} className="rounded-md border">
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedSaleId(expandedSaleId === sale.id ? null : sale.id)
                      }
                      className="flex-1 text-left"
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          销售单 #{sale.id} · 客户：{sale.customer_name_snapshot}
                        </div>
                        <div className="text-xs text-gray-500">
                          总金额：{sale.total_amount} ｜ 实收：{sale.received_amount} ｜ 状态：
                          {sale.status === "completed" ? "已完成" : "已作废"}
                        </div>
                      </div>
                    </button>

                    <div className="ml-4 flex items-center gap-2">
                      {sale.status === "completed" ? (
                        <button
                          type="button"
                          onClick={() => handleVoidSale(sale.id)}
                          className="rounded-md border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          作废
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">不可作废</span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedSaleId(expandedSaleId === sale.id ? null : sale.id)
                        }
                        className="text-xs text-gray-500"
                      >
                        {expandedSaleId === sale.id ? "收起" : "展开"}
                      </button>
                    </div>
                  </div>

                  {expandedSaleId === sale.id ? (
                    <div className="border-t px-4 py-4">
                      <div className="mb-3 text-sm text-gray-600">
                        备注：{sale.note || "-"}
                      </div>

                      <div className="overflow-hidden rounded-md border">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50 text-left">
                            <tr>
                              <th className="px-3 py-2">商品</th>
                              <th className="px-3 py-2">数量</th>
                              <th className="px-3 py-2">单价</th>
                              <th className="px-3 py-2">小计</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sale.items.map((item) => (
                              <tr key={item.id} className="border-t">
                                <td className="px-3 py-2">{item.product_name_snapshot}</td>
                                <td className="px-3 py-2">{item.qty}</td>
                                <td className="px-3 py-2">{item.unit_price}</td>
                                <td className="px-3 py-2">{item.subtotal}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </form>
    </div>
  );
}