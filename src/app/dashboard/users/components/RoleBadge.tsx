"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check } from "lucide-react";
import clsx from "clsx";

const roleColors: Record<string, string> = {
  Admin: "bg-red-100 text-red-800 border-red-200",
  Editor: "bg-blue-100 text-blue-800 border-blue-200",
  Viewer: "bg-green-100 text-green-800 border-green-200",
};

interface RoleBadgeProps {
  role: string;
  onChange?: (newRole: string) => void;
}

const availableRoles = ["Admin", "Editor", "Viewer"];

export function RoleBadge({ role, onChange }: RoleBadgeProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Badge
          variant="outline"
          className={clsx(
            "cursor-pointer transition-all select-none hover:scale-105",
            roleColors[role] || "bg-gray-100 text-gray-700 border-gray-300"
          )}
        >
          {role}
        </Badge>
      </PopoverTrigger>
      {onChange && (
        <PopoverContent className="w-40 p-2">
          <div className="flex flex-col space-y-1">
            {availableRoles.map((r) => (
              <button
                key={r}
                className={clsx(
                  "flex items-center justify-between rounded-md px-2 py-1 text-sm transition hover:bg-gray-100",
                  r === role && "bg-gray-50 font-medium"
                )}
                onClick={() => {
                  onChange(r);
                  setOpen(false);
                }}
              >
                <span>{r}</span>
                {r === role && <Check size={14} />}
              </button>
            ))}
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
}
