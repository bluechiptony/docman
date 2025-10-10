"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, File, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UploadDocumentsModalProps = {
  open: boolean;
  onClose: () => void;
  onUploadComplete?: (files: any[]) => void;
  parentFolderId?: string | null;
};

export default function UploadDocumentsModal({
  open,
  onClose,
  onUploadComplete,
  parentFolderId,
}: UploadDocumentsModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles([...files, ...droppedFiles]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const simulateUpload = async () => {
    setIsUploading(true);
    setCompleted(false);
    const updatedFiles: any[] = [];

    for (const file of files) {
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

      // Simulate upload with delay
      await new Promise<void>((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 20;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            updatedFiles.push({
              id: crypto.randomUUID(),
              name: file.name,
              type: file.type.includes("pdf")
                ? "PDF"
                : file.type.includes("sheet")
                ? "Excel"
                : file.type.includes("word")
                ? "Word"
                : "Other",
              size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
              uploadedBy: "You",
              updatedAt: new Date().toISOString().split("T")[0],
            });
            resolve();
          }
          setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
        }, 300);
      });
    }

    setCompleted(true);
    setIsUploading(false);
    setFiles([]);

    // Simulate completion callback
    if (onUploadComplete) onUploadComplete(updatedFiles);
    setTimeout(() => {
      onClose();
      setCompleted(false);
      setUploadProgress({});
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Drop Zone */}
          <motion.div
            ref={dropRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            whileHover={{ scale: 1.01 }}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-amber-500 transition"
          >
            <Upload className="mx-auto mb-3 text-amber-600" size={36} />
            <p className="text-gray-600">
              Drag & drop files here or{" "}
              <label htmlFor="file-upload" className="text-amber-600 underline cursor-pointer">
                browse
              </label>
            </p>
            <Input id="file-upload" type="file" multiple onChange={handleFileSelect} className="hidden" />
          </motion.div>

          {/* File List */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {files.map((file) => (
                  <motion.div
                    key={file.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-between bg-gray-50 rounded-md p-3 border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <File className="text-gray-500" size={18} />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>

                    {!isUploading && (
                      <Button size="icon" variant="ghost" onClick={() => removeFile(file.name)}>
                        <X className="text-red-500" size={16} />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Bars */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="space-y-2">
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{fileName}</span>
                    <span>{Math.floor(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              ))}
            </div>
          )}

          {/* Completion */}
          {completed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center text-green-600 gap-2 font-medium"
            >
              <CheckCircle2 size={18} />
              Upload Complete
            </motion.div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              onClick={simulateUpload}
              disabled={files.length === 0 || isUploading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isUploading ? "Uploading..." : "Start Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
