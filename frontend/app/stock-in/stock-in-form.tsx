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
  products: Product[];
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export default function StockInForm({ products }: Props) {
  const router = useRouter();

  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("1");
  const [type, setType] = useState("restock");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedProduct = products.find((p) => String(p.id) === productId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/stock-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: Number(productId),
          qty: Number(qty),
          type,
          note: note || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "入库失败");
      }

      setSuccess("入库成功");
      setProductId("");
      setQty("1");
      setType("restock");
      setNote("");

      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "入库失败";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">入库管理</h2>
        <p className="text-sm text-gray-600">
          通过入库操作增加商品库存。
        </p>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-medium">新增入库记录</h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">商品</label>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
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
              {selectedProduct
                ? `${selectedProduct.current_stock} ${selectedProduct.unit}`
                : "-"}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">入库数量</label>
            <input
              type="number"
              min="1"
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">入库类型</label>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="restock">补货入库</option>
              <option value="production">生产入库</option>
              <option value="other">其他入库</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">备注</label>
            <textarea
              className="w-full rounded-md border px-3 py-2 text-sm"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="可填写入库备注"
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {submitting ? "提交中..." : "提交入库"}
            </button>

            {success ? <span className="text-sm text-green-600">{success}</span> : null}
            {error ? <span className="text-sm text-red-600">{error}</span> : null}
          </div>
        </form>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <h3 className="mb-2 text-lg font-medium">说明</h3>
        <p className="text-sm text-gray-600">
          入库成功后，系统会自动增加对应商品的当前库存。
        </p>
      </div>
    </div>
  );
}