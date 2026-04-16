"use client";

import { useMemo, useState } from "react";

type LogItem = {
  id: number;
  object_type: string;
  object_id: number;
  action: string;
  detail: string;
  operator: string;
  time: string;
};

type Props = {
  initialLogs: LogItem[];
};

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

export default function LogsClient({ initialLogs }: Props) {
  const [objectType, setObjectType] = useState("all");
  const [action, setAction] = useState("all");
  const [keyword, setKeyword] = useState("");

  const filteredLogs = useMemo(() => {
    return initialLogs.filter((log) => {
      const matchObjectType =
        objectType === "all" ? true : log.object_type === objectType;

      const matchAction =
        action === "all" ? true : log.action === action;

      const matchKeyword =
        keyword.trim() === ""
          ? true
          : log.detail.includes(keyword.trim()) ||
            log.operator.includes(keyword.trim());

      return matchObjectType && matchAction && matchKeyword;
    });
  }, [initialLogs, objectType, action, keyword]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">操作日志</h2>
        <p className="text-sm text-gray-600">
          查看系统中的关键操作记录。
        </p>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-medium">筛选条件</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">对象类型</label>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={objectType}
              onChange={(e) => setObjectType(e.target.value)}
            >
              <option value="all">全部</option>
              <option value="product">商品</option>
              <option value="sale">销售单</option>
              <option value="stock_in">入库</option>
              <option value="customer">客户</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">动作</label>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={action}
              onChange={(e) => setAction(e.target.value)}
            >
              <option value="all">全部</option>
              <option value="create">新增</option>
              <option value="update">编辑</option>
              <option value="deactivate">停用</option>
              <option value="void">作废</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">关键字</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索详情或操作人"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="mb-3 text-sm text-gray-500">
          共找到 {filteredLogs.length} 条日志
        </div>

        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="rounded-md border px-4 py-6 text-center text-gray-500">
              没有符合条件的日志
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="rounded-md border px-4 py-4">
                <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
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

                  <div className="text-xs text-gray-500">
                    {formatTime(log.time)}
                  </div>
                </div>

                <div className="text-sm font-medium text-gray-900">
                  {log.detail}
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  操作人：{log.operator}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}