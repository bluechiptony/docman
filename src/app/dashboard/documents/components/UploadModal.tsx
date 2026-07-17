"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useDocuments } from "../hooks/useDocuments";
import { X, UploadCloud } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth.provider";
import { getDocumentTypes, searchDocumentTypes, type DocumentType } from "@/lib/document-types.service";
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { organizationsApi } from "@/api/organizations";
import {
  getEffectiveUploadPolicy,
  validateFileAgainstPolicy,
  bytesToMegabytes,
  type UploadPolicy,
} from "@/lib/upload-policy";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (fileName: string, fileUrl: string) => void; // ✅
  currentFolderId?: string | null;
}

export default function UploadModal({ isOpen, onClose, onUploadComplete, currentFolderId }: UploadModalProps) {
  const { handleUpload, cancelUpload } = useDocuments();
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [cancelled, setCancelled] = useState<Record<string, boolean>>({});
  const [isDragging, setIsDragging] = useState(false);

  // New: Mode and Document Type state
  const [mode, setMode] = useState<"standard" | "typed">("standard");
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [docTypesLoading, setDocTypesLoading] = useState(false);
  const [selectedDocTypeId, setSelectedDocTypeId] = useState<string | null>(null);
  const [docTypeQuery, setDocTypeQuery] = useState("");
  const [docTypeOpen, setDocTypeOpen] = useState(false);
  const [docTypeResults, setDocTypeResults] = useState<DocumentType[]>([]);
  const [uploadPolicy, setUploadPolicy] = useState<UploadPolicy>(getEffectiveUploadPolicy());
  const organizationId = user?.selectedOrganization?.id ?? user?.organizations?.[0]?.id ?? null;

  useEffect(() => {
    if (isOpen && mode === "typed" && organizationId) {
      setDocTypesLoading(true);
      getDocumentTypes(organizationId)
        .then((types) => setDocTypes(types))
        .catch(() => toast.error("Failed to load document types"))
        .finally(() => setDocTypesLoading(false));
    }
  }, [isOpen, mode, organizationId]);

  // Debounced remote search and open dropdown based on results
  useEffect(() => {
    if (!isOpen || mode !== "typed" || !organizationId) return;
    const q = docTypeQuery.trim();
    if (q.length < 2) {
      setDocTypeResults([]);
      setDocTypeOpen(false);
      return;
    }

    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const results = await searchDocumentTypes(organizationId, q);
        if (cancelled) return;
        setDocTypeResults(results);
        setDocTypeOpen(results.length > 0);
      } catch (e) {
        if (cancelled) return;
        setDocTypeResults([]);
        setDocTypeOpen(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [docTypeQuery, isOpen, mode, organizationId]);

  useEffect(() => {
    if (!isOpen || !organizationId) {
      return;
    }

    let cancelled = false;
    organizationsApi
      .getOrganizationById(organizationId)
      .then((organization) => {
        if (cancelled) {
          return;
        }

        setUploadPolicy(
          getEffectiveUploadPolicy({
            maxUploadSizeBytes: organization.maxUploadSizeBytes,
            allowedUploadExtensions: organization.allowedUploadExtensions,
          }),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setUploadPolicy(getEffectiveUploadPolicy());
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, organizationId]);

  const filteredDocTypes = docTypeQuery
    ? docTypes.filter((dt) => {
        const q = docTypeQuery.toLowerCase().trim();
        return dt.name.toLowerCase().includes(q) || (dt.description ? dt.description.toLowerCase().includes(q) : false);
      })
    : docTypes;

  // ✅ Combine newly added files with existing ones (avoid duplicates)
  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const incoming = Array.from(newFiles);

      const acceptedFiles = incoming.filter((file) => {
        const validation = validateFileAgainstPolicy(file, uploadPolicy);
        if (!validation.valid) {
          if (validation.reason === "size") {
            const maxSizeMb = bytesToMegabytes(uploadPolicy.maxUploadSizeBytes);
            const fileSizeMb = bytesToMegabytes(file.size);
            toast.error(`File too large: ${file.name}`, {
              description: `Max size: ${maxSizeMb}MB, Your file: ${fileSizeMb}MB`,
            });
          } else if (validation.reason === "type") {
            const allowedTypes = uploadPolicy.allowedUploadExtensions.join(", ");
            toast.error(`File type not allowed: ${file.name}`, {
              description: `Allowed types: ${allowedTypes}`,
            });
          } else {
            toast.error(`File rejected: ${file.name}`);
          }
          return false;
        }

        return true;
      });

      setFiles((prev) => {
        if (mode === "typed") {
          // In typed mode, enforce single file: replace with first new file
          return acceptedFiles.length ? [acceptedFiles[0]] : prev.slice(0, 1);
        }
        const existingNames = new Set(prev.map((f) => f.name));
        const unique = acceptedFiles.filter((f) => !existingNames.has(f.name));
        return [...prev, ...unique];
      });
    },
    [mode, uploadPolicy],
  );

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

    // Validation for typed mode
    if (mode === "typed") {
      if (!selectedDocTypeId) {
        toast.error("Please select a document type");
        return;
      }
      if (files.length !== 1) {
        toast.error("Only one file can be uploaded in this mode");
        return;
      }
    }

    setIsUploading(true);

    const progressState: Record<string, number> = {};
    files.forEach((f) => (progressState[f.name] = 0));
    setProgress(progressState);

    // Upload files in parallel with toast feedback
    await Promise.all(
      files.map(async (file) => {
        const toastId = toast.loading(`Uploading ${file.name}...`);

        try {
          await handleUpload(
            [file],
            (fileName, percent) => {
              setProgress((prev) => ({
                ...prev,
                [fileName]: percent,
              }));

              // Update toast progress if needed
              toast.message(`${fileName} ${percent.toFixed(0)}%`, { id: toastId });
            },
            mode === "typed"
              ? { documentTypeId: selectedDocTypeId || undefined, targetFolderId: currentFolderId ?? null }
              : { targetFolderId: currentFolderId ?? null },
          );

          const uploadedUrl = `https://example-bucket.com/${file.name}`; // or real response
          toast.success(`${file.name} uploaded successfully!`, { id: toastId });
          onUploadComplete?.(file.name, uploadedUrl);
        } catch (err) {
          toast.error(`Failed to upload ${file.name}`, { id: toastId });
        }
      }),
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
          {/* Mode toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === "standard" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("standard")}
            >
              Standard
            </Button>
            <Button
              type="button"
              variant={mode === "typed" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("typed")}
            >
              With Document Type
            </Button>
          </div>

          {mode === "typed" && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Select a document type</p>
              <Popover open={docTypeOpen} onOpenChange={setDocTypeOpen}>
                <PopoverTrigger asChild>
                  <div>
                    <Input
                      placeholder="Search document types..."
                      value={docTypeQuery}
                      onChange={(e) => setDocTypeQuery(e.target.value)}
                      onFocus={() => setDocTypeOpen(docTypeResults.length > 0)}
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0 w-[var(--radix-popover-trigger-width)]">
                  <Command>
                    <CommandList>
                      {docTypesLoading ? (
                        <div className="p-3 text-sm text-muted-foreground">Loading...</div>
                      ) : docTypeResults.length ? (
                        docTypeResults.map((dt) => (
                          <CommandItem
                            key={dt.id}
                            onSelect={() => {
                              setSelectedDocTypeId(dt.id);
                              setDocTypeQuery(dt.name);
                              setDocTypeOpen(false);
                            }}
                            className={clsx(selectedDocTypeId === dt.id && "bg-muted")}
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{dt.name}</span>
                              {dt.description ? (
                                <span className="text-xs text-muted-foreground">{dt.description}</span>
                              ) : null}
                            </div>
                          </CommandItem>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-muted-foreground">No document types found</div>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedDocTypeId ? (
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span>Selected type: {docTypes.find((d) => d.id === selectedDocTypeId)?.name || "(unknown)"}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedDocTypeId(null)}>
                    Clear
                  </Button>
                </div>
              ) : null}
              <p className="text-xs text-muted-foreground">Note: Only a single file is allowed in this mode.</p>
            </div>
          )}

          {/* 📋 Upload Policy Information */}
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-gray-700">Upload Requirements</p>
            <div className="space-y-1">
              <p className="text-xs text-gray-600">
                <span className="font-medium">Max file size:</span> {bytesToMegabytes(uploadPolicy.maxUploadSizeBytes)}
                MB
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-medium">Allowed types:</span>{" "}
                {uploadPolicy.allowedUploadExtensions.map((ext) => ext.toUpperCase()).join(", ")}
              </p>
            </div>
          </div>

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
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400",
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
              multiple={mode !== "typed"}
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
          <Button
            onClick={startUpload}
            disabled={!files.length || isUploading || (mode === "typed" && !selectedDocTypeId)}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
