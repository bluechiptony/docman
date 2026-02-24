"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createFolderExshareInvites } from "@/lib/exshare.service";

function parseEmails(value: string): string[] {
  return value
    .split(/[\s,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => !!e);
}

function isValidEmail(email: string): boolean {
  return /.+@.+\..+/.test(email);
}

type FolderExshareDialogProps = {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  target:
    | { type: "folder"; folderId: string; folderName: string }
    | { type: "client"; clientId: string; clientName: string }
    | null;
};

export default function FolderExshareDialog({ open, onClose, organizationId, target }: FolderExshareDialogProps) {
  const [emailsInput, setEmailsInput] = useState("");
  const [permission, setPermission] = useState<"VIEW" | "EDIT">("VIEW");
  const [sending, setSending] = useState(false);

  const title = target?.type === "client" ? `Share Client Folders via Email` : "Share Folder via Email";

  const targetLabel =
    target?.type === "client"
      ? `Client: ${target.clientName}`
      : target?.type === "folder"
        ? `Folder: ${target.folderName}`
        : "";

  const handleSend = async () => {
    if (!target) return;
    if (!organizationId) {
      toast.error("Select an organization first");
      return;
    }
    const emails = parseEmails(emailsInput);
    if (emails.length === 0) {
      toast.error("Enter at least one email");
      return;
    }

    const invalid = emails.filter((email) => !isValidEmail(email));
    if (invalid.length > 0) {
      toast.error(`Invalid emails: ${invalid.slice(0, 3).join(", ")}${invalid.length > 3 ? "..." : ""}`);
      return;
    }

    setSending(true);
    try {
      await createFolderExshareInvites({
        emails,
        permission,
        organizationId,
        shareType: target.type === "client" ? "CLIENT" : "SINGLE",
        clientId: target.type === "client" ? target.clientId : undefined,
        folderIds: target.type === "folder" ? [target.folderId] : undefined,
      });

      toast.success(`Invitations sent to ${emails.length} recipient(s)`);
      setEmailsInput("");
      setPermission("VIEW");
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create folder share invites");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {!!targetLabel && <p className="text-sm text-muted-foreground">{targetLabel}</p>}

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Emails (comma or space separated)</label>
            <Input
              placeholder="e.g. person@example.com other@company.com"
              value={emailsInput}
              onChange={(e) => setEmailsInput(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Permission</label>
            <Select value={permission} onValueChange={(value: "VIEW" | "EDIT") => setPermission(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIEW">View</SelectItem>
                <SelectItem value="EDIT">Edit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending || !target}>
            {sending ? "Sending..." : "Send Invites"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
