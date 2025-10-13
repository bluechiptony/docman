"use client";

import { motion } from "framer-motion";
import { FileText, Folder, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DocumentItem } from "../hooks/useDocuments";

interface Props {
  items: DocumentItem[];
  onFolderOpen: (id: string, name: string) => void;
  onMove: (itemId: string, targetFolderId: string | null) => void;
  onDelete: (id: string) => void;
}

export function DocumentsGrid({ items, onFolderOpen, onMove, onDelete }: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);

  const handleDragStart = (id: string) => setDraggingId(id);

  const handleDrop = (targetId: string | null) => {
    if (draggingId && targetId !== draggingId) {
      onMove(draggingId, targetId);
      toast.success("Item moved successfully");
    }
    setDraggingId(null);
    setHoveredFolder(null);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setHoveredFolder(id);
  };

  const handleDragLeave = () => setHoveredFolder(null);

  if (items.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border border-dashed rounded-xl">
        <Folder className="h-10 w-10 mb-2 opacity-60" />
        <p>No documents here yet</p>
      </div>
    );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <motion.div
          key={item.id}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          draggable
          onDragStart={() => handleDragStart(item.id)}
          onDragOver={(e) => item.type === "folder" && handleDragOver(e, item.id)}
          onDragLeave={handleDragLeave}
          onDrop={() => item.type === "folder" && handleDrop(item.id)}
          className={`relative cursor-pointer p-4 rounded-xl border bg-white shadow-sm transition group ${
            hoveredFolder === item.id
              ? "border-amber-500 ring-2 ring-amber-200"
              : "hover:shadow-md"
          }`}
          onDoubleClick={() =>
            item.type === "folder" ? onFolderOpen(item.id, item.name) : null
          }
        >
          <div className="flex flex-col items-center gap-3">
            {item.type === "folder" ? (
              <Folder
                className={`h-10 w-10 ${
                  hoveredFolder === item.id
                    ? "text-amber-600"
                    : "text-gray-700"
                }`}
              />
            ) : (
              <FileText className="h-10 w-10 text-blue-600" />
            )}
            <p className="text-sm text-center truncate w-full">{item.name}</p>
          </div>

          {item.type !== "folder" && (
            <button
              onClick={() => onDelete(item.id)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-gray-500 hover:text-red-500"
            >
              <Trash className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      ))}
    </div>
  );
}
