"use client";

import { Menu, LogOut, User } from "lucide-react";
import { useAuth } from "@/providers/auth.provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  toggleMobileSidebar: () => void;
}

export default function TopBar({ toggleMobileSidebar }: TopBarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between bg-white px-4 py-3 border-b border-gray-200 shadow-sm">
      {/* Mobile Menu Button */}
      <button onClick={toggleMobileSidebar} className="md:hidden text-gray-700 focus:outline-none">
        <Menu size={24} />
      </button>

      <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>

      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <img src="https://i.pravatar.cc/40" alt="User" className="w-8 h-8 rounded-full border border-gray-300" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{user?.emailAddress}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
