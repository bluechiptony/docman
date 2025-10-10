"use client";

import { useState } from "react";
import { LayoutDashboard, FileText, Users, Settings, Menu } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Documents", icon: FileText, href: "/documents" },
  { name: "Users", icon: Users, href: "/users" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 240 }}
      className="h-screen bg-gray-900 text-white flex flex-col shrink-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && <span className="font-bold text-lg">Docman</span>}
        <Menu className="cursor-pointer" onClick={() => setCollapsed(!collapsed)} />
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 p-3 rounded-md hover:bg-gray-800 transition",
                collapsed && "justify-center"
              )}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
