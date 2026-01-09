// components/users/InviteUserDialog.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useUsers } from "../hooks/useUsers";

interface InviteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteUserDialog({ isOpen, onClose }: InviteUserDialogProps) {
  const { inviteUser } = useUsers();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email) return;
    setLoading(true);
    await inviteUser(email, role as "ADMINISTRATOR" | "EDITOR" | "VIEWER");
    setLoading(false);
    setEmail("");
    setRole("VIEWER");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label>Role</Label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            >
              <option value="VIEWER">Viewer</option>
              <option value="EDITOR">Editor</option>
              <option value="ADMINISTRATOR">Admin</option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={loading}>
            {loading ? "Inviting..." : "Send Invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
