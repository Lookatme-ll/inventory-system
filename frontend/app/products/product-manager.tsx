"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

type Props = {
  initialProducts: Product[];
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export default function ProductManager({ initialProducts }: Props) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [spec, setSpec] = useState("");
  const [unit, setUnit] = useState("");
  const [defaultPrice, setDefaultPrice] = useState("0");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          spec: spec || null,
          unit,
          default_price: Number(defaultPrice),
          note: note || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "新增商品失败");
      }

      setSuccess("商品新增成功");
      setName("");
      setSpec("");
      setUnit("");
      setDefaultPrice("0");
      setNote("");

      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "新增商品失败";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(productId: number) {
    const confirmed = window.confirm("确认停用这个商品吗？停用后将不能继续用于销售和入库。");
    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}/deactivate`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "停用商品失败");
      }

      setSuccess("商品已停用");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "停用商品失败";
      setError(message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">商品管理</h2>
        <p className="text-sm text-gray-600">新增商品并查看商品列表。</p>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-medium">新增商品</h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">名称</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="请输入商品名称"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">规格</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              placeholder="请输入规格"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">单位</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
              placeholder="如：斤、个、箱"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">默认售价</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              type="number"
              min="0"
              value={defaultPrice}
              onChange={(e) => setDefaultPrice(e.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">备注</label>
            <textarea
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="可填写备注"
              rows={3}
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {submitting ? "提交中..." : "新增商品"}
            </button>

            {success ? <span className="text-sm text-green-600">{success}</span> : null}
            {error ? <span className="text-sm text-red-600">{error}</span> : null}
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">名称</th>
              <th className="px-4 py-3">规格</th>
              <th className="px-4 py-3">单位</th>
              <th className="px-4 py-3">默认售价</th>
              <th className="px-4 py-3">当前库存</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">备注</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {initialProducts.map((product) => (
              <tr key={product.id} className="border-t">
                <td className="px-4 py-3">{product.id}</td>
                <td className="px-4 py-3">{product.name}</td>
                <td className="px-4 py-3">{product.spec || "-"}</td>
                <td className="px-4 py-3">{product.unit}</td>
                <td className="px-4 py-3">{product.default_price}</td>
                <td className="px-4 py-3">{product.current_stock}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      product.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {product.status === "active" ? "启用" : "停用"}
                  </span>
                </td>
                <td className="px-4 py-3">{product.note || "-"}</td>
                <td className="px-4 py-3">
                    {product.status === "active" ? (
                    <button
                        type="button"
                        onClick={() => handleDeactivate(product.id)}
                        className="rounded-md border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                        停用
                    </button>
                    ) : (
                    <span className="text-xs text-gray-400">已停用</span>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}