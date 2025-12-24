"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { documentTypesApi } from "@/api/document-types";
import { folderRequiredDocumentsApi } from "@/api/folder-required-documents";
import { useAuth, useAuthUser } from "@/providers/auth.provider";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronDown } from "lucide-react";

interface DocumentTypeOption {
  id: string;
  name: string;
}
interface FolderRequiredDocumentConfig {
  id: string;
  name: string;
  documentTypes: DocumentTypeOption[];
}

const FolderRequiredDocumentsDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthUser ();
  const id = params?.id as string;
  const [config, setConfig] = useState<FolderRequiredDocumentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDocumentTypeIds, setEditDocumentTypeIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [docTypes, setDocTypes] = useState<DocumentTypeOption[]>([]);
  const [openPopover, setOpenPopover] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Initial data fetch
  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      if (!user?.organizations?.[0]?.id) {
        if (!cancelled) {
          setError("No organization found");
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const organizationId = user.organizations[0].id;
        const [cfg, dt] = await Promise.all([
          folderRequiredDocumentsApi.getById(id),
          documentTypesApi.getByOrganization(organizationId),
        ]);
        if (!cancelled) {
          setConfig(cfg);
          setEditName(cfg.name);
          setEditDocumentTypeIds(cfg.documentTypes.map((d) => d.id));
          setDocTypes(dt);
        }
      } catch (e) {
        if (!cancelled) setError("Failed to load configuration");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (id) fetchAll();
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  // Search document types
  useEffect(() => {
    if (!openPopover || !user?.organizations?.[0]?.id) return;
    let cancelled = false;

    async function searchDocTypes() {
      try {
        const organizationId = user?.organizations[0].id;
        const data = searchTerm
          ? await documentTypesApi.searchByName(organizationId, searchTerm)
          : await documentTypesApi.getByOrganization(organizationId);
        if (!cancelled) setDocTypes(data);
      } catch (e) {
        console.error("Failed to search document types", e);
      }
    }

    const timeoutId = setTimeout(searchDocTypes, 300);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [searchTerm, openPopover, user]);

  const toggleDocumentType = (id: string) => {
    setEditDocumentTypeIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const selectedDocTypes = docTypes.filter((dt) => editDocumentTypeIds.includes(dt.id));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editName.trim()) {
      setError("Name is required");
      return;
    }

    if (editDocumentTypeIds.length === 0) {
      setError("Please select at least one document type");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updated = await folderRequiredDocumentsApi.update(id, {
        name: editName,
        documentTypeIds: editDocumentTypeIds,
      });
      setConfig(updated);
      toast.success("Configuration updated successfully");
    } catch (e: any) {
      const errorMsg = e.response?.data?.message || "Failed to save changes";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error && !config) return <div className="text-red-500 p-4">{error}</div>;
  if (!config) return <div className="p-4">Not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Edit Folder Required Documents</h2>
        <p className="text-gray-600">Manage the document types required for this configuration</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium">Configuration Name *</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Document Types *</label>

          {selectedDocTypes.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {selectedDocTypes.map((dt) => (
                <Badge
                  key={dt.id}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => toggleDocumentType(dt.id)}
                >
                  {dt.name} ×
                </Badge>
              ))}
            </div>
          )}

          <Popover open={openPopover} onOpenChange={setOpenPopover}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Select document types
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search document types..."
                  onValueChange={(value) => {
                    console.log("Search term:", value);
                    setSearchTerm(value);
                  }}
                />
                <CommandEmpty>No document type found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {docTypes.map((dt) => (
                      <CommandItem key={dt.id} value={dt.name} onSelect={() => toggleDocumentType(dt.id)}>
                        <Checkbox
                          checked={editDocumentTypeIds.includes(dt.id)}
                          onCheckedChange={() => toggleDocumentType(dt.id)}
                          className="mr-2"
                        />
                        {dt.name}
                        {editDocumentTypeIds.includes(dt.id) && <Check className="ml-auto h-4 w-4" />}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</div>}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => router.back()} disabled={saving}>
            Back
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FolderRequiredDocumentsDetailPage;
