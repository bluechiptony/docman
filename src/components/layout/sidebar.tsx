"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, FileText, Users, Settings, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Documents", icon: FileText, href: "/dashboard/documents" },
  { name: "Users", icon: Users, href: "/dashboard/users" },
  { name: "Settings", icon: Settings, href: "/dashboard/settings" },
];

interface SidebarProps {
  isMobile: boolean;
  collapsed: boolean;
  isMobileOpen: boolean;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
}

export default function Sidebar({
  isMobile,
  collapsed,
  isMobileOpen,
  toggleSidebar,
  toggleMobileSidebar,
}: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!collapsed && <span className="font-bold text-lg">Docman</span>}
        {isMobile ? (
          <X className="cursor-pointer md:hidden" onClick={toggleMobileSidebar} />
        ) : (
          <Menu className="cursor-pointer" onClick={toggleSidebar} />
        )}
      </div>

      {/* Navigation */}
      <TooltipProvider>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            const linkClasses = cn(
              "flex items-center gap-3 p-3 rounded-md transition",
              isActive
                ? "bg-gray-800 text-amber-400"
                : "hover:bg-gray-800 text-gray-300",
              collapsed && !isMobile && "justify-center"
            );

            const linkElement = (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => isMobile && toggleMobileSidebar()}
                className={linkClasses}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );

            return collapsed && !isMobile ? (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>{linkElement}</TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.name}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              linkElement
            );
          })}
        </nav>
      </TooltipProvider>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 240 }}
        className="hidden md:flex h-screen shrink-0"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-40 md:hidden"
              onClick={toggleMobileSidebar}
            />

            {/* Sidebar */}
            <motion.aside
              key="mobileSidebar"
              initial={{ x: -250 }}
              animate={{ x: 0 }}
              exit={{ x: -250 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-64 bg-gray-900 z-50 md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
