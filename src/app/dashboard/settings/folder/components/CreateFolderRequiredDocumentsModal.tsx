"use client";
import React, { useEffect, useState } from "react";
import { documentTypesApi } from "@/api/document-types";
import { folderRequiredDocumentsApi } from "@/api/folder-required-documents";
import { useAuth } from "@/providers/auth.provider";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronDown } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface DocumentTypeOption {
  id: string;
  name: string;
}

interface SelectedDocumentType {
  id: string;
  isRequired: boolean;
}

const CreateFolderRequiredDocumentsModal: React.FC<Props> = ({ isOpen, onClose, onCreated }) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<SelectedDocumentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docTypes, setDocTypes] = useState<DocumentTypeOption[]>([]);
  const [loadingDocTypes, setLoadingDocTypes] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Initial fetch when modal opens
  useEffect(() => {
    if (!isOpen || !user?.selectedOrganization?.id) return;
    let cancelled = false;

    async function fetchDocTypes() {
      setLoadingDocTypes(true);
      try {
        const organizationId = user?.selectedOrganization?.id;
        if (!organizationId) return;
        const data = await documentTypesApi.getByOrganization(organizationId);
        if (!cancelled) setDocTypes(data);
      } catch (e) {
        if (!cancelled) setError("Failed to load document types");
      } finally {
        if (!cancelled) setLoadingDocTypes(false);
      }
    }

    fetchDocTypes();
    return () => {
      cancelled = true;
    };
  }, [isOpen, user?.selectedOrganization?.id]);

  // Search document types when popover is open and search term changes
  useEffect(() => {
    if (!openPopover || !user?.selectedOrganization?.id) return;

    let cancelled = false;

    async function searchDocTypes() {
      setLoadingDocTypes(true);
      try {
        const organizationId = user?.selectedOrganization?.id;
        if (!organizationId) return;

        const data = searchTerm
          ? await documentTypesApi.searchByName(organizationId, searchTerm)
          : await documentTypesApi.getByOrganization(organizationId);
        if (!cancelled) setDocTypes(data);
      } catch (e) {
        console.error("Failed to search document types", e);
      } finally {
        if (!cancelled) setLoadingDocTypes(false);
      }
    }

    // Debounce search
    const timeoutId = setTimeout(searchDocTypes, 300);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [searchTerm, openPopover, user]);

  // Reset search when popover closes
  useEffect(() => {
    if (!openPopover) {
      setSearchTerm("");
    }
  }, [openPopover]);

  const reset = () => {
    setName("");
    setSelectedDocuments([]);
    setError(null);
  };

  const toggleDocumentType = (id: string) => {
    setSelectedDocuments((prev) =>
      prev.find((d) => d.id === id) ? prev.filter((item) => item.id !== id) : [...prev, { id, isRequired: true }]
    );
  };

  const toggleDocumentRequired = (id: string) => {
    setSelectedDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, isRequired: !d.isRequired } : d)));
  };

  const selectedDocTypes = docTypes.filter((dt) => selectedDocuments.find((sd) => sd.id === dt.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (selectedDocuments.length === 0) {
      setError("Please select at least one document type");
      return;
    }
    console.log("Org", user?.organizations);

    if (!user?.organizations?.[0]?.id) {
      setError("Organization not found");
      return;
    }

    console.log({
      name,
      documentTypeIds: selectedDocuments,
      organizationId: user.organizations[0]?.id,
    });

    setLoading(true);
    setError(null);
    try {
      await folderRequiredDocumentsApi.create({
        name,
        documentTypeIds: selectedDocuments,
        organizationId: user.organizations[0]?.id,
      });
      toast.success("Configuration created successfully");
      onCreated();
      reset();
      onClose();
    } catch (e: any) {
      const errorMsg = e.response?.data?.message || "Failed to create configuration";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Folder Required Documents</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Configuration Name *</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Standard Applicant Documents"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Document Types *</label>

            {selectedDocTypes.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {selectedDocTypes.map((dt) => {
                  const selected = selectedDocuments.find((sd) => sd.id === dt.id);
                  return (
                    <div key={dt.id} className="flex items-center gap-1">
                      <Badge
                        variant={selected?.isRequired ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleDocumentType(dt.id)}
                      >
                        {dt.name} ×
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 px-2 text-xs"
                        onClick={() => toggleDocumentRequired(dt.id)}
                        title={selected?.isRequired ? "Click to make optional" : "Click to make required"}
                      >
                        {selected?.isRequired ? "Required" : "Optional"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            <Popover open={openPopover} onOpenChange={setOpenPopover}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between" disabled={loadingDocTypes}>
                  {loadingDocTypes ? "Loading..." : "Select document types"}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search document types..."
                    onValueChange={(value) => {
                      setSearchTerm(value);
                    }}
                  />
                  <CommandEmpty>No document type found.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {docTypes.map((dt) => (
                        <CommandItem key={dt.id} value={dt.name} onSelect={() => toggleDocumentType(dt.id)}>
                          <Checkbox
                            checked={selectedDocuments.some((d) => d.id === dt.id)}
                            onCheckedChange={() => toggleDocumentType(dt.id)}
                            className="mr-2"
                          />
                          {dt.name}
                          {selectedDocuments.some((d) => d.id === dt.id) && <Check className="ml-auto h-4 w-4" />}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onClose();
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderRequiredDocumentsModal;
