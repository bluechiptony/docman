"use client";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Trash2, Folder, FileText, X } from "lucide-react";
import { motion } from "framer-motion";

type Document = {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  updatedAt: string;
  folder?: string;
  description?: string;
};

type DocumentDetailsDrawerProps = {
  open: boolean;
  onClose: () => void;
  document?: Document | null;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
};

export default function DocumentDetailsDrawer({
  open,
  onClose,
  document,
  onDelete,
  onDownload,
}: DocumentDetailsDrawerProps) {
  if (!document) return null;

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="max-w-md ml-auto bg-white rounded-l-2xl shadow-lg border-l p-4">
        <DrawerHeader className="flex justify-between items-center">
          <DrawerTitle className="text-lg font-semibold">
            Document Details
          </DrawerTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </DrawerHeader>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-4 space-y-4"
        >
          {/* File Info */}
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-3 rounded-xl">
              <FileText className="text-amber-600" size={24} />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">{document.name}</h3>
              <p className="text-sm text-gray-500">
                {document.type} • {document.size}
              </p>
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Uploaded by</span>
              <span className="font-medium">{document.uploadedBy}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Last updated</span>
              <span className="font-medium">{document.updatedAt}</span>
            </div>

            {document.folder && (
              <div className="flex justify-between">
                <span className="text-gray-500">Folder</span>
                <span className="flex items-center gap-1 text-gray-700">
                  <Folder size={14} className="text-amber-600" />
                  {document.folder}
                </span>
              </div>
            )}

            {document.description && (
              <div>
                <p className="text-gray-500 mb-1">Description</p>
                <p className="text-gray-700">{document.description}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onDownload?.(document.id)}
            >
              <Download size={16} className="mr-2" />
              Download
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => onDelete?.(document.id)}
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </Button>
          </div>
        </motion.div>
      </DrawerContent>
    </Drawer>
  );
}
