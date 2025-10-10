"use client";

import { Menu } from "lucide-react";

interface TopBarProps {
  toggleMobileSidebar: () => void;
}

export default function TopBar({ toggleMobileSidebar }: TopBarProps) {
  return (
    <header className="flex items-center justify-between bg-white px-4 py-3 border-b border-gray-200 shadow-sm">
      {/* Mobile Menu Button */}
      <button onClick={toggleMobileSidebar} className="md:hidden text-gray-700 focus:outline-none">
        <Menu size={24} />
      </button>

      <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>

      <div className="flex items-center space-x-4">
        <img src="https://i.pravatar.cc/40" alt="User" className="w-8 h-8 rounded-full border border-gray-300" />
      </div>
    </header>
  );
}
