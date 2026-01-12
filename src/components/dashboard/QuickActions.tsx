"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Upload, FolderPlus, UserPlus, FileBarChart, PlusCircle, FileIcon, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/providers/auth.provider";
import { InviteUserModal } from "@/app/dashboard/users/components/InviteUserModal";
import CreateDocumentTypeModal from "@/app/dashboard/settings/document-types/components/CreateDocumentTypeModal";

export function QuickActions() {
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [openTypeModal, setOpenTypeModal] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.authentication?.role === "ADMINISTRATOR";

  const actions = [
    { id: "upload", name: "Upload Document", icon: Upload, color: "bg-blue-100 text-blue-700" },
    { id: "folder", name: "Create Folder", icon: FolderPlus, color: "bg-green-100 text-green-700" },
    { id: "invite", name: "Invite User", icon: UserPlus, color: "bg-amber-100 text-amber-700" },
    { id: "report", name: "Generate Report", icon: FileBarChart, color: "bg-purple-100 text-purple-700" },
    { id: "newType", name: "Add New Type", icon: PlusCircle, color: "bg-pink-100 text-pink-700" },
  ];

  const open = (id: string) => {
    if ((id === "invite" || id === "newType") && !isAdmin) return;
    if (id === "newType") {
      setOpenTypeModal(true);
      return;
    }
    setOpenModal(id);
  };
  const close = () => {
    setOpenModal(null);
    setOpenTypeModal(false);
    setFiles([]);
    setUploadProgress({});
    setUploadError(null);
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
  };

  // Handle drag & drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => event.preventDefault();

  // Remove file
  const removeFile = (fileName: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  // Upload with Axios
  const handleUpload = async () => {
    if (!files.length) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("documentName", file.name);

        await axios.post("/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress((prev) => ({
                ...prev,
                [file.name]: percent,
              }));
            }
          },
        });
      }

      setTimeout(() => close(), 1000);
    } catch (error: any) {
      console.error("Upload failed:", error);
      setUploadError("File upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {actions
          .filter((action) => (action.id === "invite" || action.id === "newType" ? isAdmin : true))
          .map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => open(action.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl shadow-sm hover:shadow-md transition-all ${action.color}`}
              >
                <Icon size={24} />
                <span className="mt-2 text-sm font-medium text-center">{action.name}</span>
              </motion.button>
            );
          })}
      </div>

      {/* Upload Document Modal */}
      <Dialog open={openModal === "upload"} onOpenChange={close}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
          </DialogHeader>

          <form className="space-y-4">
            <div
              ref={dropRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition"
              onClick={() => dropRef.current?.querySelector("input")?.click()}
            >
              <Input id="file" type="file" multiple className="hidden" onChange={handleFileSelect} />
              <Upload className="mx-auto mb-2 text-gray-400" size={28} />
              <p className="text-sm text-gray-600">
                Drag & drop files here, or <span className="font-medium">browse</span>
              </p>
            </div>

            {files.length > 0 && (
              <div className="space-y-3 mt-4 max-h-48 overflow-y-auto">
                {files.map((file) => (
                  <div key={file.name} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <div className="flex items-center space-x-2">
                      <FileIcon size={20} className="text-gray-500" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {uploadProgress[file.name] != null && (
                        <Progress value={uploadProgress[file.name]} className="w-24 h-2" />
                      )}
                      {!isUploading && (
                        <button
                          type="button"
                          onClick={() => removeFile(file.name)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {uploadError && <p className="text-sm text-red-600 font-medium">{uploadError}</p>}

            <DialogFooter>
              <Button variant="outline" onClick={close} disabled={isUploading}>
                Cancel
              </Button>
              <Button type="button" onClick={handleUpload} disabled={!files.length || isUploading}>
                {isUploading ? "Uploading..." : "Start Upload"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Folder Modal */}
      <Dialog open={openModal === "folder"} onOpenChange={close}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Folder</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div>
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input id="folder-name" placeholder="e.g., Legal Documents" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invite User Modal (admin only) */}
      <InviteUserModal open={openModal === "invite" && isAdmin} onClose={close} onInviteSuccess={close} />

      {/* Create Document Type Modal (admin only) */}
      <CreateDocumentTypeModal
        isOpen={openTypeModal && isAdmin}
        onClose={() => setOpenTypeModal(false)}
        onCreated={() => setOpenTypeModal(false)}
      />
    </>
  );
}
