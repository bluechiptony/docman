"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2, Link as LinkIcon, Copy } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface SharedUser {
  id: string;
  name: string;
  email: string;
  permission: string;
}

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  documentId: string;
}

export default function ShareDialog({ open, onClose, documentId }: ShareDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permission, setPermission] = useState("view");

  // Public sharing
  const [isPublic, setIsPublic] = useState(false);
  const [publicPermission, setPublicPermission] = useState("view");
  const [publicLink, setPublicLink] = useState("");

  // Fetch existing shares and public state
  useEffect(() => {
    if (open) {
      Promise.all([
        fetch(`/api/documents/${documentId}/shares`).then((res) => res.json()),
        fetch(`/api/documents/${documentId}/public`).then((res) => res.json()),
      ])
        .then(([shared, pub]) => {
          setSharedUsers(shared);
          setIsPublic(pub.isPublic);
          setPublicPermission(pub.permission || "view");
          setPublicLink(pub.link || "");
        })
        .catch(() => toast.error("Failed to load sharing info"));
    }
  }, [open, documentId]);

  // Search platform users
  useEffect(() => {
    if (search.trim().length > 1) {
      fetch(`/api/users?search=${search}`)
        .then((res) => res.json())
        .then(setUsers)
        .catch(() => toast.error("Failed to fetch users"));
    }
  }, [search]);

  // Handle new share
  const handleShare = async () => {
    if (!selectedUser) return toast.warning("Select a user first");

    const res = await fetch(`/api/documents/${documentId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: selectedUser.id,
        permission,
      }),
    });

    if (res.ok) {
      toast.success(`Shared with ${selectedUser.name} (${permission})`);
      const newUser = await res.json();
      setSharedUsers((prev) => [...prev, newUser]);
      setSelectedUser(null);
      setSearch("");
    } else {
      toast.error("Failed to share document");
    }
  };

  // Handle permission change for specific user
  const handlePermissionChange = async (userId: string, newPermission: string) => {
    const res = await fetch(`/api/documents/${documentId}/share/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permission: newPermission }),
    });

    if (res.ok) {
      setSharedUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, permission: newPermission } : u)));
      toast.success("Permission updated");
    } else {
      toast.error("Failed to update permission");
    }
  };

  // Handle revoke user
  const handleRevoke = async (userId: string) => {
    const res = await fetch(`/api/documents/${documentId}/share/${userId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setSharedUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("Access revoked");
    } else {
      toast.error("Failed to revoke access");
    }
  };

  // Handle public sharing toggle
  const handleTogglePublic = async (checked: boolean) => {
    const res = await fetch(`/api/documents/${documentId}/public`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isPublic: checked,
        permission: publicPermission,
      }),
    });

    if (res.ok) {
      setIsPublic(checked);
      const data = await res.json();
      setPublicLink(data.link || "");
      toast.success(checked ? "Public sharing enabled" : "Public sharing disabled");
    } else {
      toast.error("Failed to update public access");
    }
  };

  // Handle public permission change
  const handlePublicPermissionChange = async (val: string) => {
    setPublicPermission(val);
    const res = await fetch(`/api/documents/${documentId}/public`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isPublic,
        permission: val,
      }),
    });

    if (res.ok) {
      toast.success("Public permission updated");
    } else {
      toast.error("Failed to update permission");
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
            <Command>
              <CommandInput placeholder="Search users..." onValueChange={setSearch} />
              <CommandList>
                {users.map((user) => (
                  <CommandItem key={user.id} onSelect={() => setSelectedUser(user)}>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandList>
            </Command>

            {selectedUser && (
              <div className="space-y-2">
                <p className="text-sm">
                  Selected: <span className="font-medium">{selectedUser.name}</span>
                </p>
                <Select value={permission} onValueChange={setPermission}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select permission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="edit">Can Edit</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="w-full" onClick={handleShare}>
                  Share
                </Button>
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
                        <SelectTrigger className="w-[110px] h-8">
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
                      >
                        <Trash2 size={16} />
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
              <Switch checked={isPublic} onCheckedChange={handleTogglePublic} />
            </div>

            {isPublic && (
              <div className="space-y-2">
                <Select value={publicPermission} onValueChange={handlePublicPermissionChange}>
                  <SelectTrigger className="w-full">
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
