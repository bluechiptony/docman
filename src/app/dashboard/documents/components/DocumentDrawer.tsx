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
import ExshareDialog from "./ExshareDialog";
import {
  getDocumentById,
  getDocumentPreviewUrl,
  getDocumentPermissions,
  type Document,
  type DocumentPermission,
} from "@/lib/documents.service";
import { getDocumentActivityLogs, type ActivityLog } from "@/lib/activity-log.service";
import { ActivityLogList } from "@/components/common/ActivityLogList";
import { PdfCanvasViewer } from "@/components/documents/PdfCanvasViewer";
import { useAuthUser } from "@/providers/auth.provider";
import { X } from "lucide-react";

interface DocumentDrawerProps {
  open: boolean;
  onClose: () => void;
  documentId: string | null;
}

export default function DocumentDrawer({ open, onClose, documentId }: DocumentDrawerProps) {
  const { user } = useAuthUser();
  const role = user?.authentication?.role;
  const hasDetailsOnly = role === "USER" || role === "STAFF";
  const [doc, setDoc] = useState<Document | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [previewExpiresAt, setPreviewExpiresAt] = useState<string | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<DocumentPermission[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [showShareModal, setShowShareModal] = useState(false);
  const [exshareOpen, setExshareOpen] = useState(false);

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
      return (
        <div className="flex items-center justify-center bg-gray-50 border rounded overflow-hidden max-h-[70vh]">
          <img src={doc?.url} alt={doc?.name} className="w-full h-auto object-contain" loading="lazy" />
        </div>
      );
    }

    // PDF
    if (ext === "pdf") {
      return <PdfCanvasViewer url={src} title={doc?.name || "PDF preview"} className="h-full rounded border" />;
    }

    // Office files (docx, xlsx, pptx) - use Office Web Viewer if possible
    if (["docx", "doc", "xlsx", "xls", "pptx", "ppt"].includes(ext)) {
      const officeViewer = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(src)}`;
      return <iframe src={officeViewer} className="w-full h-[70vh] border rounded" title={doc?.name} />;
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
        <DrawerContent className="h-[100dvh] !max-h-[100dvh] w-full overflow-hidden p-0">
          <DrawerHeader className="shrink-0 px-4 pb-2 pt-2 sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <div className="min-w-0">
              <DrawerTitle className="truncate text-lg font-semibold">{doc?.name || "Document"}</DrawerTitle>
              <DrawerDescription>Document details and permissions</DrawerDescription>
              {previewExpiresAt ? (
                <span className="block text-xs text-muted-foreground">
                  Preview expires: {new Date(previewExpiresAt).toLocaleString()}
                </span>
              ) : null}
            </div>
            <div className="mt-2 flex shrink-0 items-center justify-center gap-2 sm:mt-0">
              <Button
                size="sm"
                variant="default"
                onClick={() => setExshareOpen(true)}
                disabled={!doc?.id}
              >
                Share via Email (Exshare)
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={onClose}
                aria-label="Close document viewer"
                title="Close document viewer"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DrawerHeader>

          <Tabs defaultValue="details" className="min-h-0 flex-1 gap-2 px-4 pb-4">
            <TabsList className={`grid w-full shrink-0 ${hasDetailsOnly ? "grid-cols-1" : "grid-cols-3"}`}>
              <TabsTrigger value="details">Details</TabsTrigger>
              {!hasDetailsOnly && <TabsTrigger value="activity">Activity</TabsTrigger>}
              {!hasDetailsOnly && <TabsTrigger value="permissions">Permissions</TabsTrigger>}
            </TabsList>

            {/* DETAILS TAB */}
            <TabsContent value="details" className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden">
              {/* Preview area - takes most of the space */}
              <div className="min-h-0 flex-1 overflow-hidden">
                {previewLoading ? (
                  <div className="flex h-full items-center justify-center rounded border p-4 text-sm">
                    Loading preview...
                  </div>
                ) : (
                  renderPreview()
                )}
              </div>

              {/* Details section - minimal height */}
              <ScrollArea className="mt-2 h-10 shrink-0">
                <div className="space-y-2 text-xs">
                  <p>
                    <strong>File Name:</strong> {doc?.folder?.name} / {doc?.name}
                  </p>
                  <p>
                    <strong>Size:</strong> {doc?.size ? `${(doc.size / 1024).toFixed(2)} KB` : "Unknown"}
                  </p>
                  <p>
                    <strong>Uploaded By:</strong>{" "}
                    {doc?.uploadedBy ? `${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName}` : "Unknown"}
                  </p>
                  <p>
                    <strong>Created:</strong> {doc?.createdAt ? new Date(doc.createdAt).toLocaleString() : "Unknown"}
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* ACTIVITY TAB */}
            {!hasDetailsOnly && (
              <TabsContent value="activity" className="mt-0 min-h-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <ActivityLogList
                    logs={activities}
                    loading={activitiesLoading}
                    showDocument={false}
                    showFolder={false}
                    emptyMessage="No activity logs for this document"
                  />
                </ScrollArea>
              </TabsContent>
            )}

            {/* PERMISSIONS */}
            {!hasDetailsOnly && (
              <TabsContent value="permissions" className="mt-0 min-h-0 overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-muted-foreground">Shared with:</span>
                    {permissions.slice(0, 3).map((p) => (
                      <div key={p.id} className="flex items-center gap-1">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback>{p.user.firstName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs">
                          {p.user.firstName} {p.user.lastName}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {p.role}
                        </Badge>
                      </div>
                    ))}
                    {permissions.length > 3 ? (
                      <span className="text-xs text-muted-foreground">+{permissions.length - 3} more</span>
                    ) : null}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setShowShareModal(true)}>
                    + Add User
                  </Button>
                </div>
                <ScrollArea className="h-[calc(100%-3rem)]">
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
            )}
          </Tabs>
        </DrawerContent>
      </Drawer>

      {/* Share Dialog modal */}
      {doc && <ShareDialog open={showShareModal} onClose={() => setShowShareModal(false)} documentId={doc.id} />}

      {/* Exshare Dialog */}
      <ExshareDialog open={exshareOpen} onClose={() => setExshareOpen(false)} documentId={doc?.id ?? null} />
    </>
  );
}
