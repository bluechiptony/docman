"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { documentCategoriesApi, type DocumentCategory } from "@/api/document-categories";
import { useAuth } from "@/providers/auth.provider";

type FormData = {
  name: string;
  description: string;
};

export default function DocumentCategoriesSettings() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DocumentCategory | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
  });

  const organizationId = user?.selectedOrganization?.id;

  // Guard: user must be authenticated
  if (!user || !organizationId) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Please log in to manage document categories</div>
      </div>
    );
  }

  useEffect(() => {
    if (organizationId) {
      fetchCategories();
    }
  }, [organizationId]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      if (!organizationId) return;
      const result = await documentCategoriesApi.getByOrganization(organizationId);
      setCategories(result);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load document categories");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category?: DocumentCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    // Guard: ensure user context is available
    if (!organizationId) {
      toast.error("Organization context not available");
      return;
    }

    try {
      if (editingCategory) {
        // Update existing
        await documentCategoriesApi.update(editingCategory.id, organizationId, {
          name: formData.name,
          description: formData.description || undefined,
        });
        toast.success("Category updated successfully");
      } else {
        // Create new
        await documentCategoriesApi.create({
          name: formData.name,
          description: formData.description || undefined,
          organizationId,
        });
        toast.success("Category created successfully");
      }

      handleCloseDialog();
      fetchCategories();
    } catch (error: any) {
      console.error("Error saving category:", error);
      const message = error.response?.data?.message || "Failed to save category";
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    // Guard: ensure organization context
    if (!organizationId) {
      toast.error("Organization context not available");
      return;
    }

    try {
      await documentCategoriesApi.delete(id, organizationId);
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      const message = error.response?.data?.message || "Failed to delete category";
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading document categories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Document Categories</h2>
          <p className="text-sm text-gray-500 mt-1">Organize document types into categories for better structure</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <FolderOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-2">No categories yet</p>
          <p className="text-sm text-gray-400 mb-4">Create your first category to organize document types</p>
          <Button onClick={() => handleOpenDialog()} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Document Types</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-gray-600">{category.description || "—"}</TableCell>
                  <TableCell>{category.documentTypes.length}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(category)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)}>
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
            <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Financial Documents, Legal, HR"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this category..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">{editingCategory ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
