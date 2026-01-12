"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createExshareInvites } from "@/lib/exshare.service";

function parseEmails(value: string): string[] {
  return value
    .split(/[\s,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => !!e);
}

function isValidEmail(email: string): boolean {
  // Simple validation; backend will enforce rigorously
  return /.+@.+\..+/.test(email);
}

type ExshareDialogProps = {
  open: boolean;
  onClose: () => void;
  documentId: string | null;
};

export default function ExshareDialog({ open, onClose, documentId }: ExshareDialogProps) {
  const [emailsInput, setEmailsInput] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!documentId) return;
    const emails = parseEmails(emailsInput);
    if (emails.length === 0) {
      toast.error("Enter at least one email");
      return;
    }
    const invalid = emails.filter((e) => !isValidEmail(e));
    if (invalid.length > 0) {
      toast.error(`Invalid emails: ${invalid.slice(0, 3).join(", ")}${invalid.length > 3 ? "..." : ""}`);
      return;
    }

    setSending(true);
    try {
      await createExshareInvites(documentId, emails, "VIEW");
      // Email sending is handled server-side later (Mailgun TODO)
      toast.success(`Invitations queued for ${emails.length} recipient(s)`);
      setEmailsInput("");
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create exshare invites");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share via Email (Exshare)</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Emails (comma or space separated)</label>
          <Input
            placeholder="e.g. person@example.com other@company.com"
            value={emailsInput}
            onChange={(e) => setEmailsInput(e.target.value)}
          />
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? "Sending..." : "Send Invites"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
