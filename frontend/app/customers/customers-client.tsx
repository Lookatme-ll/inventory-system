"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Customer = {
  id: number;
  name: string;
  note?: string | null;
  status: string;
};

type Props = {
  initialCustomers: Customer[];
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export default function CustomersClient({ initialCustomers }: Props) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const filteredCustomers = useMemo(() => {
    return initialCustomers.filter((customer) => {
      const matchKeyword =
        keyword.trim() === "" ||
        customer.name.includes(keyword.trim()) ||
        (customer.note ?? "").includes(keyword.trim());

      const matchStatus =
        status === "all" ? true : customer.status === status;

      return matchKeyword && matchStatus;
    });
  }, [initialCustomers, keyword, status]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          note: note || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "新增客户失败");
      }

      setSuccess("客户新增成功");
      setName("");
      setNote("");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "新增客户失败";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(customerId: number) {
    const confirmed = window.confirm("确认停用这个客户吗？");
    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/customers/${customerId}/deactivate`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "停用客户失败");
      }

      setSuccess("客户已停用");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "停用客户失败";
      setError(message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">客户管理</h2>
        <p className="text-sm text-gray-600">
          新增客户并查看客户列表。
        </p>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-medium">新增客户</h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">客户名称</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="请输入客户名称"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">备注</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="可填写客户备注"
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {submitting ? "提交中..." : "新增客户"}
            </button>

            {success ? <span className="text-sm text-green-600">{success}</span> : null}
            {error ? <span className="text-sm text-red-600">{error}</span> : null}
          </div>
        </form>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-medium">筛选条件</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">关键字</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="输入客户名称或备注"
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
        </div>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="mb-3 text-sm text-gray-500">
          共找到 {filteredCustomers.length} 个客户
        </div>

        <div className="overflow-hidden rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">客户名称</th>
                <th className="px-4 py-3">备注</th>
                <th className="px-4 py-3">状态</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr className="border-t">
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    没有符合条件的客户
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-t">
                    <td className="px-4 py-3">{customer.id}</td>
                    <td className="px-4 py-3">{customer.name}</td>
                    <td className="px-4 py-3">{customer.note || "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          customer.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {customer.status === "active" ? "启用" : "停用"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {customer.status === "active" ? (
                        <button
                          type="button"
                          onClick={() => handleDeactivate(customer.id)}
                          className="rounded-md border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          停用
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">已停用</span>
                      )}
                    </td>
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