"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmationModal({
  open,
  onClose,
  title,
  description,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false,
  onConfirm,
}: ConfirmationModalProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error: unknown) {
      // Error handling is done by caller
      console.error("Confirmation action failed:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-start gap-4">
          {isDestructive && (
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-red-100">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          )}
          <div>
            <DialogTitle className={isDestructive ? "text-red-600" : ""}>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </div>
        </DialogHeader>

        {message && <div className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">{message}</div>}

        <DialogFooter className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading} variant={isDestructive ? "destructive" : "default"}>
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
