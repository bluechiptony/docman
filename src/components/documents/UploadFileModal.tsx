"use client";

import { useState, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { X, UploadCloud } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadFileModal({ isOpen, onClose }: UploadFileModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const newFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    setProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 100));
      setProgress(i);
    }

    // Reset after upload
    setTimeout(() => {
      setUploading(false);
      setFiles([]);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Upload Documents</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-800" />
          </button>
        </div>

        <div
          className={`m-4 p-6 border-2 border-dashed rounded-xl text-center transition-colors ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <UploadCloud className="mx-auto w-10 h-10 text-gray-500" />
          <p className="mt-2 text-gray-700">Drag and drop files here</p>
          <p className="text-sm text-gray-400">or click to browse</p>

          <input
            type="file"
            multiple
            className="hidden"
            id="fileInput"
            onChange={handleFileChange}
          />
          <label
            htmlFor="fileInput"
            className="mt-3 inline-block cursor-pointer bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Browse Files
          </label>
        </div>

        {files.length > 0 && (
          <div className="max-h-40 overflow-y-auto px-4 space-y-2">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center text-sm border p-2 rounded-lg"
              >
                <span className="truncate w-2/3">{file.name}</span>
                <span className="text-gray-500 text-xs">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            ))}
          </div>
        )}

        {uploading && (
          <div className="px-4 py-2">
            <Progress value={progress} className="w-full h-2" />
          </div>
        )}

        <div className="flex justify-end gap-3 p-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
}



//    {/* Create Folder Modal */}
//       <Dialog open={openModal === "folder"} onOpenChange={close}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Create Folder</DialogTitle>
//           </DialogHeader>
//           <form className="space-y-4">
//             <div>
//               <Label htmlFor="folder-name">Folder Name</Label>
//               <Input id="folder-name" placeholder="e.g., Legal Documents" />
//             </div>
//             <DialogFooter>
//               <Button variant="outline" onClick={close}>
//                 Cancel
//               </Button>
//               <Button type="submit">Create</Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* Invite User Modal */}
//       <Dialog open={openModal === "invite"} onOpenChange={close}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Invite New User</DialogTitle>
//           </DialogHeader>
//           <form className="space-y-4">
//             <div>
//               <Label htmlFor="user-email">Email Address</Label>
//               <Input id="user-email" type="email" placeholder="e.g., john@company.com" />
//             </div>
//             <div>
//               <Label htmlFor="role">Role</Label>
//               <Input id="role" placeholder="e.g., Editor" />
//             </div>
//             <DialogFooter>
//               <Button variant="outline" onClick={close}>
//                 Cancel
//               </Button>
//               <Button type="submit">Send Invite</Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>