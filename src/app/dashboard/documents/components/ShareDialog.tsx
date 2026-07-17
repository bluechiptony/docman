"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2, Link as LinkIcon, Copy, Loader2, X } from "lucide-react";
import {
  getDocumentShares,
  getDocumentPublicShare,
  updateDocumentPublicShare,
  addDocumentShare,
  updateDocumentShare,
  revokeDocumentShare,
  type SharedUser,
} from "@/lib/documents.service";
import { searchUsers, type PlatformUser } from "@/lib/users.service";

interface User extends PlatformUser {}

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  documentId: string;
}

export default function ShareDialog({ open, onClose, documentId }: ShareDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [permission, setPermission] = useState("view");

  // Public sharing
  const [isPublic, setIsPublic] = useState(false);
  const [publicPermission, setPublicPermission] = useState("view");
  const [publicLink, setPublicLink] = useState("");

  // Loading / optimistic state
  const [loadingSharedInfo, setLoadingSharedInfo] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [shareSubmitting, setShareSubmitting] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [revokingUserId, setRevokingUserId] = useState<string | null>(null);
  const [publicUpdating, setPublicUpdating] = useState(false);
  const [publicPermissionUpdating, setPublicPermissionUpdating] = useState(false);

  // Fetch existing shares and public state
  useEffect(() => {
    if (!open) return;
    setLoadingSharedInfo(true);
    (async () => {
      try {
        const [shared, pub] = await Promise.all([getDocumentShares(documentId), getDocumentPublicShare(documentId)]);
        setSharedUsers(shared);
        setIsPublic(pub.isPublic);
        setPublicPermission(pub.permission || "view");
        setPublicLink(pub.link || "");
      } catch (e) {
        toast.error("Failed to load sharing info");
      } finally {
        setLoadingSharedInfo(false);
      }
    })();
  }, [open, documentId]);

  // Search platform users
  useEffect(() => {
    let active = true;
    (async () => {
      const q = search.trim();
      if (q.length > 1) {
        try {
          if (active) setUsersLoading(true);
          const results = await searchUsers(q);

          if (active) setUsers(results);
        } catch (e) {
          if (active) toast.error("Failed to fetch users");
        } finally {
          if (active) setUsersLoading(false);
        }
      } else {
        setUsers([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [search]);

  // Handle user selection from search results
  const handleSelectUser = (user: User) => {
    // Check if user is already selected
    if (selectedUsers.some((u) => u.id === user.id)) {
      toast.warning("User already selected");
      return;
    }
    // Check if user is already shared with
    if (sharedUsers.some((u) => u.id === user.id)) {
      toast.warning("Document already shared with this user");
      return;
    }
    setSelectedUsers((prev) => [...prev, user]);
    setSearch(""); // Clear search after selection
  };

  // Remove user from selected list
  const handleRemoveSelectedUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Handle sharing with all selected users
  const handleShare = async () => {
    if (selectedUsers.length === 0) return toast.warning("Select at least one user");

    setShareSubmitting(true);
    const successfulShares: SharedUser[] = [];
    const failedShares: string[] = [];

    // Create temp users for optimistic update
    const tempUsers: SharedUser[] = selectedUsers.map((user) => ({
      id: `temp_${user.id}`,
      name: user.name,
      email: user.email,
      permission: permission as "view" | "edit",
    }));
    setSharedUsers((prev) => [...prev, ...tempUsers]);

    try {
      // Share with each selected user
      for (const user of selectedUsers) {
        try {
          const newUser = await addDocumentShare(documentId, {
            userId: user.id,
            permission: permission as "VIEW" | "EDIT",
          });
          successfulShares.push(newUser);
        } catch (e) {
          failedShares.push(user.name);
        }
      }

      // Update shared users list - replace temp users with actual data
      setSharedUsers((prev) => {
        const withoutTemp = prev.filter((u) => !u.id.startsWith("temp_"));
        return [...withoutTemp, ...successfulShares];
      });

      // Show results
      if (successfulShares.length > 0) {
        toast.success(`Shared with ${successfulShares.length} user(s)`);
      }
      if (failedShares.length > 0) {
        toast.error(`Failed to share with: ${failedShares.join(", ")}`);
      }

      // Clear selection
      setSelectedUsers([]);
      setSearch("");
    } catch (e) {
      // Remove all temp users on complete failure
      setSharedUsers((prev) => prev.filter((u) => !u.id.startsWith("temp_")));
      toast.error("Failed to share document");
    } finally {
      setShareSubmitting(false);
    }
  };

  // Handle permission change for specific user
  const handlePermissionChange = async (userId: string, newPermission: string) => {
    const prevPerm = sharedUsers.find((u) => u.id === userId)?.permission as "view" | "edit" | undefined;
    setSharedUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, permission: newPermission as "view" | "edit" } : u)),
    );
    setUpdatingUserId(userId);
    try {
      const updated = await updateDocumentShare(documentId, userId, newPermission as "view" | "edit");
      setSharedUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, permission: updated.permission } : u)));
      toast.success("Permission updated");
    } catch {
      // rollback
      if (prevPerm) {
        setSharedUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, permission: prevPerm } : u)));
      }
      toast.error("Failed to update permission");
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Handle revoke user
  const handleRevoke = async (userId: string) => {
    const prevList = sharedUsers;
    setSharedUsers((prev) => prev.filter((u) => u.id !== userId));
    setRevokingUserId(userId);
    try {
      await revokeDocumentShare(documentId, userId);
      toast.success("Access revoked");
    } catch {
      // rollback
      setSharedUsers(prevList);
      toast.error("Failed to revoke access");
    } finally {
      setRevokingUserId(null);
    }
  };

  // Handle public sharing toggle
  const handleTogglePublic = async (checked: boolean) => {
    const prevIsPublic = isPublic;
    const prevLink = publicLink;
    setIsPublic(checked);
    setPublicUpdating(true);
    try {
      const data = await updateDocumentPublicShare(documentId, {
        isPublic: checked,
        permission: publicPermission as "view" | "edit",
      });
      setPublicLink(data.link || "");
      toast.success(checked ? "Public sharing enabled" : "Public sharing disabled");
    } catch {
      setIsPublic(prevIsPublic);
      setPublicLink(prevLink);
      toast.error("Failed to update public access");
    } finally {
      setPublicUpdating(false);
    }
  };

  // Handle public permission change
  const handlePublicPermissionChange = async (val: string) => {
    const prev = publicPermission;
    setPublicPermission(val);
    setPublicPermissionUpdating(true);
    try {
      await updateDocumentPublicShare(documentId, {
        isPublic,
        permission: val as "view" | "edit",
      });
      toast.success("Public permission updated");
    } catch {
      setPublicPermission(prev);
      toast.error("Failed to update permission");
    } finally {
      setPublicPermissionUpdating(false);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(publicLink);
    toast.success("Link copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search & Add User */}
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />

              {/* Dropdown Results */}
              {search.length > 1 && (
                <div className="absolute top-full left-0 right-0 mt-1 border rounded-md bg-white shadow-lg z-50 max-h-[200px] overflow-y-auto">
                  {usersLoading && (
                    <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                    </div>
                  )}
                  {!usersLoading && users.length === 0 && (
                    <div className="p-3 text-sm text-muted-foreground">No users found</div>
                  )}
                  {!usersLoading && users.length > 0 && (
                    <div className="py-1">
                      {users.map((user) => {
                        const isAlreadySelected = selectedUsers.some((u) => u.id === user.id);
                        const isAlreadyShared = sharedUsers.some((u) => u.id === user.id);
                        const isDisabled = isAlreadySelected || isAlreadyShared;

                        return (
                          <button
                            key={user.id}
                            onClick={() => !isDisabled && handleSelectUser(user)}
                            disabled={isDisabled}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${
                              isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col flex-1">
                                <span className="font-medium">{user.name}</span>
                                <span className="text-xs text-muted-foreground">{user.email}</span>
                              </div>
                              <div className="text-xs text-muted-foreground ml-2">
                                {isAlreadySelected && <span>(Selected)</span>}
                                {isAlreadyShared && <span>(Already shared)</span>}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected users as pills */}
            {selectedUsers.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Selected Users ({selectedUsers.length})</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-sm"
                    >
                      <span className="max-w-[200px] truncate">{user.email}</span>
                      <button
                        onClick={() => handleRemoveSelectedUser(user.id)}
                        className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Select value={permission} onValueChange={setPermission}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select permission" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">View Only</SelectItem>
                      <SelectItem value="edit">Can Edit</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full" onClick={handleShare} disabled={shareSubmitting}>
                    {shareSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Sharing...
                      </span>
                    ) : (
                      `Share with ${selectedUsers.length} user${selectedUsers.length > 1 ? "s" : ""}`
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Existing Shared Users */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-2">Shared With</h3>
            {sharedUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Not shared with anyone yet.</p>
            ) : (
              <div className="space-y-2">
                {sharedUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between rounded-md border p-2">
                    <div>
                      <p className="font-medium text-sm">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={u.permission} onValueChange={(val) => handlePermissionChange(u.id, val)}>
                        <SelectTrigger className="w-[110px] h-8" disabled={updatingUserId === u.id}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="view">View</SelectItem>
                          <SelectItem value="edit">Edit</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-100"
                        onClick={() => handleRevoke(u.id)}
                        disabled={revokingUserId === u.id}
                      >
                        {revokingUserId === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={16} />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Public Sharing */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Anyone with the link
            </h3>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Allow public access</span>
              <Switch checked={isPublic} onCheckedChange={handleTogglePublic} disabled={publicUpdating} />
            </div>

            {isPublic && (
              <div className="space-y-2">
                <Select value={publicPermission} onValueChange={handlePublicPermissionChange}>
                  <SelectTrigger className="w-full" disabled={publicPermissionUpdating}>
                    <SelectValue placeholder="Select permission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="edit">Can Edit</SelectItem>
                  </SelectContent>
                </Select>

                {publicLink && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={publicLink}
                      className="flex-1 border rounded-md px-2 py-1 text-sm"
                    />
                    <Button variant="outline" size="icon" onClick={handleCopyLink}>
                      <Copy size={16} />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
