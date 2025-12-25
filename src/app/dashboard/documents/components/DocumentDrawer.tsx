"use client";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoleBadge } from "../../users/components/RoleBadge";
import ShareDialog from "./ShareDialog";
import {
  getDocumentById,
  getDocumentPreviewUrl,
  getDocumentPermissions,
  type Document,
  type DocumentPermission,
} from "@/lib/documents.service";
import { getDocumentActivityLogs, type ActivityLog } from "@/lib/activity-log.service";
import { ActivityLogList } from "@/components/common/ActivityLogList";

interface DocumentDrawerProps {
  open: boolean;
  onClose: () => void;
  documentId: string | null;
}

export default function DocumentDrawer({ open, onClose, documentId }: DocumentDrawerProps) {
  const [doc, setDoc] = useState<Document | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [previewExpiresAt, setPreviewExpiresAt] = useState<string | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<DocumentPermission[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [showShareModal, setShowShareModal] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("Viewer");

  // Dummy list of platform users
  const platformUsers = [
    { id: "1", name: "Jane Doe", role: "Admin" },
    { id: "2", name: "Samuel Obeng", role: "Viewer" },
    { id: "3", name: "Ada Nwosu", role: "Editor" },
    { id: "4", name: "Chidi Okafor", role: "Admin" },
    { id: "5", name: "Mary Johnson", role: "Editor" },
  ];

  const handleAddUser = () => {
    if (!selectedUser) {
      toast.error("Select a user to share with");
      return;
    }

    const user = platformUsers.find((u) => u.id === selectedUser);
    if (!user) return;

    // Prevent duplicate additions
    if (permissions.some((p) => p.user.id === selectedUser)) {
      toast.info(`${user.name} already has access.`);
      return;
    }

    // Note: This should ideally make an API call to grant permissions
    // For now, we'll just update local state
    toast.success(`${user.name} added as ${selectedRole}`);
    setShowShareModal(false);
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    // Note: This should make an API call to update permissions
    // For now, just show a toast
    const permission = permissions.find((p) => p.user.id === userId);
    if (permission) {
      toast.success(`${permission.user.firstName}'s role updated to ${newRole}`);
    }
  };

  useEffect(() => {
    if (!documentId || !open) return;

    // Fetch document metadata and the signed preview URL (Cloudinary)
    const load = async () => {
      setLoading(true);
      setPreviewLoading(true);
      setActivitiesLoading(true);
      try {
        const [docResult, previewResult, activitiesResult, permissionsResult] = await Promise.allSettled([
          getDocumentById(documentId),
          getDocumentPreviewUrl(documentId, 300), // 5 minutes
          getDocumentActivityLogs(documentId, 1, 50),
          getDocumentPermissions(documentId),
        ]);

        if (docResult.status === "fulfilled") {
          setDoc(docResult.value);
        }

        if (previewResult.status === "fulfilled") {
          setPreviewUrl(previewResult.value.url);
          setPreviewExpiresAt(previewResult.value.expiresAt ?? null);
        } else {
          setPreviewUrl(null);
          setPreviewExpiresAt(null);
        }

        if (activitiesResult.status === "fulfilled") {
          setActivities(activitiesResult.value.data);
        }

        if (permissionsResult.status === "fulfilled") {
          setPermissions(permissionsResult.value);
        }
      } catch (e) {
        console.error("Failed to load document data", e);
        toast.error("Failed to load document details");
      } finally {
        setLoading(false);
        setPreviewLoading(false);
        setActivitiesLoading(false);
      }
    };

    load();
  }, [documentId, open]);

  const getExtension = (name: string) => {
    return (name || "").split(".").pop()?.toLowerCase() || "";
  };

  const renderPreview = () => {
    const ext = getExtension(doc?.name ?? "");
    // prefer explicit previewUrl, else doc.url
    const src = previewUrl ?? doc?.url ?? null;

    if (!src)
      return (
        <div className="p-4 border rounded text-sm">
          <p>
            No preview available.{" "}
            <a className="text-blue-600 underline" href={`/api/documents/${documentId}/download`}>
              Download
            </a>
          </p>
        </div>
      );

    // Images
    if (["png", "jpg", "jpeg", "gif", "webp", "bmp"].includes(ext)) {
      return <img src={src} alt={doc?.name} className="max-h-96 w-full object-contain rounded" />;
    }

    // PDF
    if (ext === "pdf") {
      return <iframe src={src} className="w-full h-96 border rounded" title={doc?.name} />;
    }

    // Office files (docx, xlsx, pptx) - use Office Web Viewer if possible
    if (["docx", "doc", "xlsx", "xls", "pptx", "ppt"].includes(ext)) {
      const officeViewer = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(src)}`;
      return <iframe src={officeViewer} className="w-full h-96 border rounded" title={doc?.name} />;
    }

    // Fallback: attempt to embed as generic file
    return (
      <div className="p-4 border rounded text-sm">
        <p>Preview not available for this file type.</p>
        <a className="text-blue-600 underline" href={src} target="_blank" rel="noreferrer">
          Open / Download
        </a>
      </div>
    );
  };

  const updateUserRole = (id: string, newRole: string) => {
    setPermissions((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
  };

  //   if (!doc) return null;

  return (
    <>
      <Drawer open={open} onClose={onClose}>
        <DrawerContent className="p-4 md:max-w-md ml-auto h-screen">
          <DrawerHeader>
            <DrawerTitle className="text-lg font-semibold">{doc?.name || "Document"}</DrawerTitle>
            <div className="flex flex-col">
              <DrawerDescription>Document details and permissions</DrawerDescription>
              {previewExpiresAt ? (
                <span className="text-xs text-muted-foreground">
                  Preview expires: {new Date(previewExpiresAt).toLocaleString()}
                </span>
              ) : null}
            </div>
          </DrawerHeader>

          <Tabs defaultValue="details" className="mt-4">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            {/* DETAILS TAB */}
            <TabsContent value="details" className="mt-4">
              {/* Preview area */}
              <div className="mb-4">
                {previewLoading ? (
                  <div className="p-4 border rounded text-sm">Loading preview...</div>
                ) : (
                  renderPreview()
                )}
              </div>

              <ScrollArea className="h-80">
                <div className="space-y-3 text-sm">
                  <p>
                    <strong>File Name:</strong> {doc?.name}
                  </p>
                  <p>
                    <strong>Size:</strong> {doc?.size ? `${(doc.size / 1024).toFixed(2)} KB` : "Unknown"}
                  </p>
                  <p>
                    <strong>Type:</strong> {doc?.mimeType || "Unknown"}
                  </p>
                  <p>
                    <strong>Uploaded By:</strong>{" "}
                    {doc?.uploadedBy ? `${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName}` : "Unknown"}
                  </p>
                  <p>
                    <strong>Created:</strong> {doc?.createdAt ? new Date(doc.createdAt).toLocaleString() : "Unknown"}
                  </p>
                  <p>
                    <strong>Last Modified:</strong>{" "}
                    {doc?.updatedAt ? new Date(doc.updatedAt).toLocaleString() : "Unknown"}
                  </p>
                  {doc?.documentType && (
                    <p>
                      <strong>Document Type:</strong> {doc.documentType.name}
                    </p>
                  )}
                  {doc?.folder && (
                    <p>
                      <strong>Folder:</strong> {doc.folder.name}
                    </p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* ACTIVITY TAB */}
            <TabsContent value="activity" className="mt-4">
              <ScrollArea className="h-80">
                <ActivityLogList
                  logs={activities}
                  loading={activitiesLoading}
                  showDocument={false}
                  showFolder={false}
                  emptyMessage="No activity logs for this document"
                />
              </ScrollArea>
            </TabsContent>

            {/* PERMISSIONS */}
            <TabsContent value="permissions" className="mt-4">
              <div className="flex justify-end mb-3">
                <Button size="sm" variant="outline" onClick={() => setShowShareModal(true)}>
                  + Add User
                </Button>
              </div>
              <ScrollArea className="h-80">
                {permissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No permissions set</p>
                ) : (
                  <ul className="space-y-2">
                    {permissions.map((p) => (
                      <li key={p.id} className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{p.user.firstName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{`${p.user.firstName} ${p.user.lastName}`}</span>
                            <span className="text-xs text-muted-foreground">{p.user.email}</span>
                          </div>
                        </div>

                        {/* Editable Role */}
                        <Select value={p.role} onValueChange={(value) => handleRoleChange(p.user.id, value)}>
                          <SelectTrigger className="w-[110px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Viewer">Viewer</SelectItem>
                            <SelectItem value="Editor">Editor</SelectItem>
                            <SelectItem value="Owner">Owner</SelectItem>
                          </SelectContent>
                        </Select>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DrawerContent>
      </Drawer>

      {/* Share Dialog modal */}
      {doc && <ShareDialog open={showShareModal} onClose={() => setShowShareModal(false)} documentId={doc.id} />}
    </>
  );
}
