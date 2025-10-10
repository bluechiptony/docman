"use client";
import Sidebar from "@/components/layout/sidebar";
import "../globals.css";
import TopBar from "@/components/layout/topbar";
import { useEffect, useState } from "react";

const metadata = {
  title: "Docman | Document Management System",
  description: "Manage, organize, and access documents efficiently.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // load/save collapse state
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState) setCollapsed(savedState === "true");
  }, []);
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(collapsed));
  }, [collapsed]);

  const toggleSidebar = () => setCollapsed((prev) => !prev);
  const toggleMobileSidebar = () => setIsMobileOpen((prev) => !prev);

  return (
    <html lang="en">
      <body className="flex flex-row h-screen overflow-hidden bg-gray-50">
        <Sidebar
          //   isOpen={isSidebarOpen}
          isMobile={isMobile}
          collapsed={collapsed}
          isMobileOpen={isMobileOpen}
          toggleSidebar={toggleSidebar}
          toggleMobileSidebar={toggleMobileSidebar}
        />
        <main className="flex-1 flex flex-col overflow-y-auto">
          <TopBar toggleMobileSidebar={toggleMobileSidebar} />
          <div className="p-6">{children}</div>
        </main>
      </body>
    </html>
  );
}
