"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, FileType } from "lucide-react";
import { toast } from "sonner";
import {
  getDocumentTypes,
  createDocumentType,
  updateDocumentType,
  deleteDocumentType,
  type DocumentType,
  type CreateDocumentTypeDto,
  type UpdateDocumentTypeDto,
} from "@/lib/document-types.service";
import { useAuth } from "@/providers/auth.provider";

type FormData = {
  name: string;
  description: string;
};

export default function DocumentTypesSettings() {
  const { user } = useAuth();
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<DocumentType | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
  });

  const organizationId = user?.selectedOrganization?.id;
  const userId = user?.id;

  console.log({
    user,
  });

  // Guard: user must be authenticated
  if (!user || !userId || !organizationId) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Please log in to manage document types</div>
      </div>
    );
  }

  useEffect(() => {
    if (organizationId) {
      fetchDocumentTypes();
    }
  }, [organizationId]);

  const fetchDocumentTypes = async () => {
    try {
      setLoading(true);
      if (!organizationId) return;
      const types = await getDocumentTypes(organizationId);
      setDocumentTypes(types as unknown as DocumentType[]);
    } catch (error) {
      console.error("Error fetching document types:", error);
      toast.error("Failed to load document types");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type?: DocumentType) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        description: type.description || "",
      });
    } else {
      setEditingType(null);
      setFormData({
        name: "",
        description: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingType(null);
    setFormData({
      name: "",
      description: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Document type name is required");
      return;
    }

    // Guard: ensure user context is available
    if (!userId || !organizationId) {
      toast.error("User context not available");
      return;
    }

    try {
      if (editingType) {
        // Update existing
        await updateDocumentType(editingType.id, {
          name: formData.name,
          description: formData.description || undefined,
          organizationId,
        });
        toast.success("Document type updated successfully");
      } else {
        // Create new
        await createDocumentType({
          name: formData.name,
          description: formData.description || undefined,
          organizationId,
          createdById: userId,
        });
        toast.success("Document type created successfully");
      }

      handleCloseDialog();
      fetchDocumentTypes();
    } catch (error: any) {
      console.error("Error saving document type:", error);
      const message = error.response?.data?.message || "Failed to save document type";
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document type?")) {
      return;
    }

    try {
      await deleteDocumentType(id);
      toast.success("Document type deleted successfully");
      fetchDocumentTypes();
    } catch (error: any) {
      console.error("Error deleting document type:", error);
      const message = error.response?.data?.message || "Failed to delete document type";
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading document types...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Document Types</h2>
          <p className="text-sm text-gray-500 mt-1">Manage custom document types for your organization</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Document Type
        </Button>
      </div>

      {documentTypes.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <FileType className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-2">No document types yet</p>
          <p className="text-sm text-gray-400 mb-4">Create your first document type to organize your documents</p>
          <Button onClick={() => handleOpenDialog()} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Document Type
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell className="text-gray-600">{type.description || "—"}</TableCell>
                  <TableCell>{type._count.documents}</TableCell>
                  <TableCell className="text-gray-600">
                    {type.createdBy.firstName} {type.createdBy.lastName}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(type)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(type.id)}
                        disabled={type._count.documents > 0}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingType ? "Edit Document Type" : "Add Document Type"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Invoice, Contract, Report"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this document type..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">{editingType ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
