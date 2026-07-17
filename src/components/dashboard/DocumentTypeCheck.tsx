"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/providers/auth.provider";
import { getDocumentTypes, createDocumentType } from "@/lib/document-types.service";
import { toast } from "sonner";

/**
 * Component that checks if the organization has at least one document type
 * Shows a modal to admins if none exist
 */
export function DocumentTypeCheck() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [checking, setChecking] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const isAdmin = user?.authentication?.role === "ADMINISTRATOR" || user?.authentication?.role === "SUPER_ADMIN";
  const organizationId = user?.selectedOrganization?.id;

  useEffect(() => {
    // Only check for admins with an organization
    if (!isAdmin || !organizationId || !user?.id) {
      return;
    }

    let cancelled = false;

    const checkDocumentTypes = async () => {
      setChecking(true);
      try {
        const documentTypes = await getDocumentTypes(organizationId);

        if (!cancelled && documentTypes.length === 0) {
          // No document types exist - show modal
          setShowModal(true);
        }
      } catch (error) {
        // Don't show error toast - fail silently to avoid disrupting user experience
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    };

    checkDocumentTypes();

    return () => {
      cancelled = true;
    };
  }, [isAdmin, organizationId, user?.id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a document type name");
      return;
    }

    if (!organizationId || !user?.id) {
      toast.error("Organization or user information not available");
      return;
    }

    setCreating(true);
    try {
      await createDocumentType({
        name: name.trim(),
        description: description.trim() || undefined,
        organizationId,
        createdById: user.id,
      });

      toast.success("Document type created successfully!");
      setShowModal(false);
      setName("");
      setDescription("");
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to create document type";
      toast.error(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  // Don't render anything if not checking and modal is not shown
  if (!checking && !showModal) {
    return null;
  }

  return (
    <Dialog open={showModal} onOpenChange={(open) => !creating && setShowModal(open)}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => creating && e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <DialogTitle>Create Your First Document Type</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Your organization doesn't have any document types yet. Document types help categorize and organize your
            documents. Let's create your first one to get started.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Document Type Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Contract, Invoice, Report"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={creating}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this document type..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={creating}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={creating || !name.trim()} className="flex-1">
              {creating ? "Creating..." : "Create Document Type"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={creating}
              className="flex-1"
            >
              Skip for Now
            </Button>
          </div>
        </form>

        <p className="text-xs text-muted-foreground pt-2">
          You can always create more document types later from Settings → Document Types
        </p>
      </DialogContent>
    </Dialog>
  );
}
