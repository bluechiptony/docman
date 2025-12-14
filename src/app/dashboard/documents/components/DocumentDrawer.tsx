"use client";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { apiClient } from "@/api/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoleBadge } from "../../users/components/RoleBadge";
import ShareDialog from "./ShareDialog";

interface DocumentDrawerProps {
  open: boolean;
  onClose: () => void;
  documentId: string | null;
}

export default function DocumentDrawer({ open, onClose, documentId }: DocumentDrawerProps) {
  const [doc, setDoc] = useState<any>({
    id: documentId,
    name: "HR_Policies_2025.pdf",
    size: 1048,
    type: "PDF Document",
    uploadedBy: "Jane Doe",
    createdAt: "2025-10-05T10:30:00Z",
    updatedAt: "2025-10-12T14:15:00Z",
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [previewExpiresAt, setPreviewExpiresAt] = useState<string | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
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
    if (permissions.some((p) => p.user === user.name)) {
      toast.info(`${user.name} already has access.`);
      return;
    }

    setPermissions((prev) => [...prev, { user: user.name, role: selectedRole }]);
    toast.success(`${user.name} added as ${selectedRole}`);
    setShowShareModal(false);
  };

  const handleRoleChange = (userName: string, newRole: string) => {
    setPermissions((prev) => prev.map((p) => (p.user === userName ? { ...p, role: newRole } : p)));
    toast.success(`${userName}'s role updated to ${newRole}`);
  };

  useEffect(() => {
    if (!documentId) return;
    // Fetch document metadata and the signed preview URL (explicit endpoint)
    const load = async () => {
      setLoading(true);
      setPreviewLoading(true);
      try {
        const [metaRes, urlRes] = await Promise.allSettled([
          apiClient.get(`/documents/${documentId}`),
          apiClient.get(`/documents/${documentId}/url?expires=300`),
        ]);

        if (metaRes.status === "fulfilled" && metaRes.value?.data) {
          setDoc(metaRes.value.data);
        }

        if (urlRes.status === "fulfilled" && urlRes.value?.data) {
          setPreviewUrl(urlRes.value.data.url ?? null);
          setPreviewExpiresAt(urlRes.value.data.expiresAt ?? null);
        } else {
          setPreviewUrl(null);
          setPreviewExpiresAt(null);
        }
      } catch (e) {
        console.error("Failed to load document metadata/preview", e);
      } finally {
        setLoading(false);
        setPreviewLoading(false);
      }
    };

    load();
  }, [documentId]);

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
        <DrawerContent className="p-4 md:max-w-md ml-auto">
          <DrawerHeader>
            <DrawerTitle className="text-lg font-semibold">{doc.name}</DrawerTitle>
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
                    <strong>File Name:</strong> {doc.name}
                  </p>
                  <p>
                    <strong>Size:</strong> {doc.size} KB
                  </p>
                  <p>
                    <strong>Type:</strong> {doc.type}
                  </p>
                  <p>
                    <strong>Uploaded By:</strong>{" "}
                    {typeof doc.uploadedBy === "string"
                      ? doc.uploadedBy
                      : doc.uploadedBy?.firstName
                      ? `${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName ?? ""}`
                      : doc.uploadedBy?.emailAddress ?? "Unknown"}
                  </p>
                  <p>
                    <strong>Created:</strong> {new Date(doc.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Last Modified:</strong> {new Date(doc.updatedAt).toLocaleString()}
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* ACTIVITY TAB */}
            <TabsContent value="activity" className="mt-4">
              <ScrollArea className="h-80">
                <ul className="space-y-2">
                  {activities.map((a, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm border-b pb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{a.user.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{a.user}</span>
                      <span>{a.action}</span>
                      <span className="text-xs text-gray-400 ml-auto">{new Date(a.timestamp).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
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
                <ul className="space-y-2">
                  {permissions.map((p, i) => (
                    <li key={i} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{p.user.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{p.user}</span>
                      </div>

                      {/* Editable Role */}
                      <Select value={p.role} onValueChange={(value) => handleRoleChange(p.user, value)}>
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
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DrawerContent>
      </Drawer>
      <ShareDialog
        open={showShareModal}
        onClose={function (): void {
          throw new Error("Function not implemented.");
        }}
        documentId={doc.id}
      />
    </>
  );
}
