"use client";

import { useMemo, useState } from "react";

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

export default function InventoryClient({ initialProducts }: Props) {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const matchKeyword =
        keyword.trim() === "" ||
        product.name.includes(keyword.trim()) ||
        (product.spec ?? "").includes(keyword.trim());

      const matchStatus =
        status === "all" ? true : product.status === status;

      const matchInStock =
        inStockOnly ? product.current_stock > 0 : true;

      return matchKeyword && matchStatus && matchInStock;
    });
  }, [initialProducts, keyword, status, inStockOnly]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">库存查询</h2>
        <p className="text-sm text-gray-600">
          查看当前库存，并按状态或关键字筛选商品。
        </p>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-medium">筛选条件</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">关键字</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="输入商品名称或规格"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">状态</label>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">全部</option>
              <option value="active">启用</option>
              <option value="inactive">停用</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              只看有库存商品
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="mb-3 text-sm text-gray-500">
          共找到 {filteredProducts.length} 个商品
        </div>

        <div className="overflow-hidden rounded-lg border">
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
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr className="border-t">
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                    没有符合条件的商品
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}