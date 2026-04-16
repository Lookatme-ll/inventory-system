import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "库存管理系统",
  description: "仓库库存、销售、入库与日志管理",
};

const navItems = [
  { href: "/", label: "首页" },
  { href: "/products", label: "商品管理" },
  { href: "/customers", label: "客户管理" },
  { href: "/sales", label: "销售开单" },
  { href: "/stock-in", label: "入库管理" },
  { href: "/inventory", label: "库存查询" },
  { href: "/logs", label: "操作日志" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          <div className="flex min-h-screen">
            <aside className="w-56 border-r bg-white">
              <div className="border-b px-6 py-5 text-xl font-semibold">
                库存管理系统
              </div>
              <nav className="flex flex-col gap-1 p-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </aside>

            <main className="flex-1">
              <header className="border-b bg-white px-6 py-4">
                <h1 className="text-lg font-semibold">管理后台</h1>
              </header>
              <section className="p-6">{children}</section>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}