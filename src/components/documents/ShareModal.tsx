"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Mail, Users } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/api/client";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
}

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  documentName: string;
  documentId?: string;
}

export default function ShareModal({ open, onClose, documentName, documentId }: ShareModalProps) {
  const [search, setSearch] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<{ user: User; permission: string }[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<{ email: string; permission: string }[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const searchUsers = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setUsers([]);
      setSearching(false);
      return;
    }

    try {
      setSearching(true);
      const response = await apiClient.get("/user/search", {
        params: { q: query.trim(), limit: 10 },
      });
      setUsers(response.data || []);
    } catch (error) {
      console.error("Failed to search users:", error);
      setUsers([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // Handle search input with debounce
  const handleSearchChange = (value: string) => {
    setSearch(value);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced search
    debounceTimerRef.current = setTimeout(() => {
      searchUsers(value);
    }, 300);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Clear search when modal closes
  useEffect(() => {
    if (!open) {
      setSearch("");
      setUsers([]);
    }
  }, [open]);

  const handleAddUser = (user: User) => {
    if (!selectedUsers.find((u) => u.user.id === user.id)) {
      setSelectedUsers((prev) => [...prev, { user, permission: "VIEWER" }]);
    }
    setSearch("");
  };

  const handleRemoveUser = (id: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.user.id !== id));
  };

  const handlePermissionChange = (id: string, permission: string) => {
    setSelectedUsers((prev) => prev.map((u) => (u.user.id === id ? { ...u, permission } : u)));
  };

  const handleAddEmail = () => {
    if (!emailInput.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!selectedEmails.find((e) => e.email === emailInput)) {
      setSelectedEmails((prev) => [...prev, { email: emailInput, permission: "VIEWER" }]);
    }
    setEmailInput("");
  };

  const handleRemoveEmail = (email: string) => {
    setSelectedEmails((prev) => prev.filter((e) => e.email !== email));
  };

  const handleEmailPermissionChange = (email: string, permission: string) => {
    setSelectedEmails((prev) => prev.map((e) => (e.email === email ? { ...e, permission } : e)));
  };

  const handleShare = async () => {
    if (selectedUsers.length === 0 && selectedEmails.length === 0) {
      toast.error("Please select at least one user or email to share with");
      return;
    }

    try {
      setLoading(true);

      // Share with selected users
      for (const { user, permission } of selectedUsers) {
        await apiClient.post(`/documents/${documentId}/permissions`, {
          userId: user.id,
          role: permission,
        });
      }

      // Share with emails (invite users if needed)
      for (const { email, permission } of selectedEmails) {
        await apiClient.post("/auth/invite", { email });
      }

      toast.success("Document shared successfully!");
      onClose();
      setSelectedUsers([]);
      setSelectedEmails([]);
    } catch (error: unknown) {
      const err = error as any;
      const message = err.response?.data?.message || "Failed to share document";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share "{documentName}"</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4 mt-4">
            <Input
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              disabled={loading || searching}
            />
            {search && search.trim().length >= 2 && users.length > 0 && (
              <div className="border rounded-md max-h-48 overflow-y-auto">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="px-3 py-2 cursor-pointer hover:bg-slate-100 transition"
                    onClick={() => handleAddUser(u)}
                  >
                    <p className="font-medium">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{u.emailAddress}</p>
                  </div>
                ))}
              </div>
            )}
            {search && search.trim().length >= 2 && users.length === 0 && !searching && (
              <p className="text-sm text-muted-foreground">No users found</p>
            )}
            {searching && <p className="text-sm text-muted-foreground">Searching...</p>}

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Selected Users ({selectedUsers.length})</p>
                {selectedUsers.map(({ user, permission }) => (
                  <div key={user.id} className="flex items-center justify-between border p-3 rounded-md">
                    <div>
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.emailAddress}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Select value={permission} onValueChange={(val) => handlePermissionChange(user.id, val)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VIEWER">Viewer</SelectItem>
                          <SelectItem value="EDITOR">Editor</SelectItem>
                          <SelectItem value="OWNER">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveUser(user.id)}>
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                disabled={loading}
              />
              <Button onClick={handleAddEmail} disabled={loading}>
                Add
              </Button>
            </div>

            {/* Selected Emails */}
            {selectedEmails.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Selected Emails ({selectedEmails.length})</p>
                {selectedEmails.map(({ email, permission }) => (
                  <div key={email} className="flex items-center justify-between border p-3 rounded-md">
                    <p className="font-medium">{email}</p>
                    <div className="flex gap-2 items-center">
                      <Select value={permission} onValueChange={(val) => handleEmailPermissionChange(email, val)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VIEWER">Viewer</SelectItem>
                          <SelectItem value="EDITOR">Editor</SelectItem>
                          <SelectItem value="OWNER">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveEmail(email)}>
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            disabled={loading || (selectedUsers.length === 0 && selectedEmails.length === 0)}
          >
            {loading ? "Sharing..." : "Share"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
