"use client";

import { Button } from "@/components/ui/button";

interface TablePaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showWhenSinglePage?: boolean;
}

export default function TablePaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  size = "sm",
  className = "",
  showWhenSinglePage = false,
}: TablePaginationControlsProps) {
  if (totalPages <= 1 && !showWhenSinglePage) {
    return null;
  }

  const safePage = Math.min(Math.max(currentPage, 1), totalPages);

  return (
    <div className={`w-full grid grid-cols-3 items-center gap-2 ${className}`.trim()}>
      <div className="flex items-center gap-2 justify-start">
        <Button variant="outline" size={size} disabled={safePage === 1} onClick={() => onPageChange(1)}>
          First
        </Button>
        <Button variant="outline" size={size} disabled={safePage === 1} onClick={() => onPageChange(safePage - 1)}>
          Previous
        </Button>
      </div>

      <span className="flex items-center justify-center px-4 text-sm text-muted-foreground">
        Page {safePage} of {totalPages}
      </span>

      <div className="flex items-center gap-2 justify-end">
        <Button
          variant="outline"
          size={size}
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
        >
          Next
        </Button>
        <Button
          variant="outline"
          size={size}
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          Last
        </Button>
      </div>
    </div>
  );
}
