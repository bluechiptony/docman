"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useDocuments } from "../hooks/useDocuments";
import { X, UploadCloud } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const { handleUpload, cancelUpload } = useDocuments();
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [cancelled, setCancelled] = useState<Record<string, boolean>>({});
  const [isDragging, setIsDragging] = useState(false);

  // ✅ Combine newly added files with existing ones (avoid duplicates)
  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const incoming = Array.from(newFiles);
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const unique = incoming.filter((f) => !existingNames.has(f.name));
      return [...prev, ...unique];
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const startUpload = async () => {
    if (!files.length) return;

    setIsUploading(true);

    const progressState: Record<string, number> = {};
    files.forEach((f) => (progressState[f.name] = 0));
    setProgress(progressState);

    // Upload files in parallel with toast feedback
    await Promise.all(
      files.map(async (file) => {
        const toastId = toast.loading(`Uploading ${file.name}...`);

        try {
          await handleUpload([file], (fileName, percent) => {
            setProgress((prev) => ({
              ...prev,
              [fileName]: percent,
            }));

            // Update toast progress if needed
            toast.message(`${fileName} ${percent.toFixed(0)}%`, { id: toastId });
          });

          toast.success(`${file.name} uploaded successfully!`, { id: toastId });
        } catch (err) {
          console.error(err);
          toast.error(`Failed to upload ${file.name}`, { id: toastId });
        }
      })
    );

    setIsUploading(false);
    setFiles([]);
    onClose();
  };

  const handleCancel = (fileName: string) => {
    cancelUpload(fileName);
    setCancelled((prev) => ({ ...prev, [fileName]: true }));
    toast.info(`${fileName} upload cancelled.`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* ✅ Drag & Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            className={clsx(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
            )}
          >
            <UploadCloud className="mx-auto mb-2 text-gray-400" size={36} />
            <p className="text-sm text-gray-600">
              Drag and drop files here or{" "}
              <label htmlFor="file-upload" className="text-blue-600 font-medium cursor-pointer hover:underline">
                browse
              </label>
            </p>
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
          </div>

          {/* ✅ File list with progress */}
          {files.length > 0 && (
            <div className="max-h-60 overflow-y-auto space-y-3">
              {files.map((file) => (
                <div key={file.name} className="flex items-center gap-3">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700 truncate block">{file.name}</span>
                    <Progress value={progress[file.name] || 0} className="h-2" />
                  </div>
                  {isUploading && !cancelled[file.name] && (
                    <Button size="icon" variant="ghost" onClick={() => handleCancel(file.name)}>
                      <X size={16} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={startUpload} disabled={!files.length || isUploading}>
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
