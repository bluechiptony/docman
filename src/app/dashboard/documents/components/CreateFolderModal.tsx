"use client";

import React, { useState, useEffect, use } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { folderRequiredDocumentsApi } from "@/api/folder-required-documents";
import { useAuth, useAuthUser } from "@/providers/auth.provider";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (name: string, parentFolderId?: string, type?: string, requiredDocsId?: string) => void;
  parentFolderId?: string;
}

type FolderType = "DOCUMENT" | "APPLICANT";

export default function CreateFolderModal({ isOpen, onClose, onCreateFolder, parentFolderId }: CreateFolderModalProps) {
  const { user } = useAuthUser();
  const [folderName, setFolderName] = useState("");
  const [folderType, setFolderType] = useState<FolderType>("APPLICANT");
  const [requiredDocsId, setRequiredDocsId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [requiredDocsConfigs, setRequiredDocsConfigs] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(false);

  // Fetch required documents configs when modal opens
  useEffect(() => {
    if (!isOpen || !user?.organizations?.[0]?.id) return;

    let cancelled = false;
    async function fetchConfigs() {
      if (!user?.organizations?.[0]?.id) return;

      setLoadingConfigs(true);
      try {
        const organizationId = user.organizations[0].id;
        const configs = await folderRequiredDocumentsApi.getByOrganization(organizationId);
        if (!cancelled) {
          setRequiredDocsConfigs(configs.map((c) => ({ id: c.id, name: c.name })));
        }
      } catch (error) {
        console.error("Failed to fetch required documents configs:", error);
      } finally {
        if (!cancelled) setLoadingConfigs(false);
      }
    }

    fetchConfigs();
    return () => {
      cancelled = true;
    };
  }, [isOpen, user]);

  const handleCreate = async () => {
    if (!folderName.trim()) {
      toast.error("Folder name is required");
      return;
    }

    setIsLoading(true);
    try {
      onCreateFolder(folderName, parentFolderId, folderType, requiredDocsId || undefined);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFolderName("");
    setFolderType("APPLICANT");
    setRequiredDocsId("");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{parentFolderId ? "Create Subfolder" : "Create New Folder"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folderName">Folder Name *</Label>
            <Input
              id="folderName"
              placeholder="Enter folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreate();
                }
              }}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="folderType">Folder Type *</Label>
            <Select
              value={folderType}
              onValueChange={(value) => setFolderType(value as FolderType)}
              disabled={isLoading}
            >
              <SelectTrigger id="folderType">
                <SelectValue placeholder="Select folder type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APPLICANT">Applicant</SelectItem>
                <SelectItem value="DOCUMENT">Document</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requiredDocs">Required Documents (Optional)</Label>
            <Select value={requiredDocsId} onValueChange={setRequiredDocsId} disabled={isLoading || loadingConfigs}>
              <SelectTrigger id="requiredDocs">
                <SelectValue placeholder={loadingConfigs ? "Loading..." : "Select configuration"} />
              </SelectTrigger>
              <SelectContent>
                {requiredDocsConfigs.map((config) => (
                  <SelectItem key={config.id} value={config.id}>
                    {config.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
