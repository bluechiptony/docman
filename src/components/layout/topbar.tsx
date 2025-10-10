"use client";

import { Search, Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function TopBar() {
  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md w-1/3">
        <Search size={18} className="text-gray-500" />
        <input placeholder="Search documents..." className="bg-transparent outline-none flex-1 text-sm" />
      </div>

      <div className="flex items-center gap-4">
        <Bell className="text-gray-600 cursor-pointer" />
        <Avatar className="w-8 h-8">
          <AvatarFallback>TE</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
