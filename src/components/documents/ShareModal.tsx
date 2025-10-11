"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
}

const mockUsers: User[] = [
  { id: "1", name: "Jane Doe", email: "jane@example.com" },
  { id: "2", name: "John Smith", email: "john@example.com" },
  { id: "3", name: "Mary Johnson", email: "mary@example.com" },
  { id: "4", name: "Alex Brown", email: "alex@example.com" },
];

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  documentName: string;
}

export default function ShareModal({ open, onClose, documentName }: ShareModalProps) {
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<{ user: User; permission: string }[]>([]);

  const filteredUsers = mockUsers.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddUser = (user: User) => {
    if (!selectedUsers.find((u) => u.user.id === user.id)) {
      setSelectedUsers((prev) => [...prev, { user, permission: "Viewer" }]);
    }
    setSearch("");
  };

  const handleRemoveUser = (id: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.user.id !== id));
  };

  const handlePermissionChange = (id: string, permission: string) => {
    setSelectedUsers((prev) => prev.map((u) => (u.user.id === id ? { ...u, permission } : u)));
  };

  const handleShare = () => {
    console.log("Sharing document with:", selectedUsers);
    onClose();
    setSelectedUsers([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{documentName}"</DialogTitle>
        </DialogHeader>

        {/* Search & Add Users */}
        <div className="space-y-4 mt-2">
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && filteredUsers.length > 0 && (
            <div className="border rounded-md max-h-40 overflow-y-auto">
              {filteredUsers.map((u) => (
                <div key={u.id} className="px-3 py-2 cursor-pointer hover:bg-gray-100" onClick={() => handleAddUser(u)}>
                  {u.name} ({u.email})
                </div>
              ))}
            </div>
          )}

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              {selectedUsers.map(({ user, permission }) => (
                <div key={user.id} className="flex items-center justify-between border p-2 rounded-md">
                  <span>
                    {user.name} ({user.email})
                  </span>
                  <div className="flex gap-2 items-center">
                    <Select value={permission} onValueChange={(val) => handlePermissionChange(user.id, val)}>
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Permission" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Viewer">Viewer</SelectItem>
                        <SelectItem value="Editor">Editor</SelectItem>
                        <SelectItem value="Commenter">Commenter</SelectItem>
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
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleShare}>Share</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
