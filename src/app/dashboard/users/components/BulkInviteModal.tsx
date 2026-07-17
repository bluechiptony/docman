"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import { clientsApi } from "@/api/clients";
import { useAuth } from "@/providers/auth.provider";
import { Upload, AlertCircle, CheckCircle, Loader, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BulkInviteModalProps {
  open: boolean;
  onClose: () => void;
  onInviteSuccess?: () => void;
}

interface Client {
  id: string;
  name: string;
}

interface ValidationResult {
  validEmails: string[];
  invalidEmails: {
    email: string;
    reason: string;
  }[];
}

export function BulkInviteModal({ open, onClose, onInviteSuccess }: BulkInviteModalProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [validating, setValidating] = useState(false);
  const [sending, setSending] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const organizationId = user?.selectedOrganization?.id || "";

  useEffect(() => {
    if (open && organizationId) {
      fetchClients(organizationId);
    }
  }, [open, organizationId]);

  const fetchClients = async (orgId: string) => {
    setLoadingClients(true);
    try {
      const response = await clientsApi.getByOrganization(orgId);
      setClients(response?.data || []);
      setSelectedClientId(undefined);
    } catch (error: any) {
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  const parseFile = async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const emails: string[] = [];

          if (file.name.endsWith(".csv")) {
            // Parse CSV
            const lines = content.split("\n");
            for (const line of lines) {
              if (!line.trim()) continue;
              const trimmed = line.trim().toLowerCase();
              // Skip header row
              if (trimmed === "email_address" || trimmed === "email") continue;
              emails.push(trimmed);
            }
          } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
            // For XLSX, we need to use a library
            // For now, we'll parse it as CSV-like
            const lines = content.split("\n");
            for (const line of lines) {
              if (!line.trim()) continue;
              const trimmed = line.trim().toLowerCase();
              if (trimmed === "email_address" || trimmed === "email") continue;
              emails.push(trimmed);
            }
          }

          resolve(emails);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsText(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const isCSV = selectedFile.name.endsWith(".csv");
    const isXLSX = selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".xls");

    if (!isCSV && !isXLSX) {
      toast.error("Please upload a CSV or XLSX file");
      return;
    }

    setFile(selectedFile);
    setValidationResult(null);
  };

  const handleValidate = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    if (!organizationId) {
      toast.error("Please select an organization");
      return;
    }

    setValidating(true);
    try {
      // Parse the file
      const emails = await parseFile(file);

      if (emails.length === 0) {
        toast.error("No valid emails found in file");
        setValidating(false);
        return;
      }

      // Call backend to validate emails
      const response = await apiClient.post("/auth/validate-bulk-invite", {
        emails,
        organizationId,
      });

      setValidationResult(response.data);

      if (response.data.invalidEmails.length > 0) {
        toast.warning(`${response.data.invalidEmails.length} email(s) have issues`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to validate emails";
      toast.error(message);
    } finally {
      setValidating(false);
    }
  };

  const handleSendInvites = async () => {
    if (!validationResult || validationResult.validEmails.length === 0) {
      toast.error("No valid emails to send invitations to");
      return;
    }

    if (!organizationId) {
      toast.error("Please select an organization");
      return;
    }

    setSending(true);
    try {
      await apiClient.post("/auth/send-bulk-invites", {
        emails: validationResult.validEmails,
        organizationId,
        clientId: selectedClientId,
      });

      toast.success(`Invitations sent to ${validationResult.validEmails.length} email(s)`);
      setFile(null);
      setValidationResult(null);
      setSelectedClientId(undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose();
      onInviteSuccess?.();
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to send invitations";
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setValidationResult(null);
    setSelectedClientId(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Invite Users</DialogTitle>
          <DialogDescription>Upload a CSV or XLSX file with email addresses to invite multiple users</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Upload File (CSV or XLSX)</Label>
              <a
                href="/bulk-invite-template.csv"
                download
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Download template
              </a>
            </div>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                disabled={validating || sending || validationResult !== null}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">{file.name}</span>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center gap-2 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">CSV or XLSX file with email_address column</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Organization Display */}
          <div className="space-y-2">
            <Label>Organization</Label>
            <div className="text-sm font-medium p-2 border rounded-md bg-muted">
              {user?.selectedOrganization?.name || "No organization"}
            </div>
          </div>

          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="client">
              Assign to Client <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            {loadingClients ? (
              <div className="text-sm text-muted-foreground">Loading clients...</div>
            ) : (
              <Select
                value={selectedClientId || ""}
                onValueChange={(value) => setSelectedClientId(value || undefined)}
                disabled={validating || sending || validationResult !== null}
              >
                <SelectTrigger id="client">
                  <SelectValue placeholder="No client selected" />
                </SelectTrigger>
                <SelectContent>
                  {clients.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      No clients available
                    </SelectItem>
                  ) : (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Validation Results */}
          {validationResult && (
            <div className="space-y-3">
              {validationResult.validEmails.length > 0 && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {validationResult.validEmails.length} valid email(s) ready to invite
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.invalidEmails.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <div className="text-red-800">
                      <p className="font-medium mb-2">
                        {validationResult.invalidEmails.length} email(s) cannot be invited:
                      </p>
                      <ul className="text-xs space-y-1">
                        {validationResult.invalidEmails.map((item, idx) => (
                          <li key={idx}>
                            <span className="font-mono">{item.email}</span> — {item.reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose} disabled={validating || sending}>
            Cancel
          </Button>

          {!validationResult ? (
            <Button onClick={handleValidate} disabled={!file || validating || !organizationId} className="gap-2">
              {validating ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Validating...
                </>
              ) : (
                "Validate Emails"
              )}
            </Button>
          ) : validationResult.validEmails.length > 0 ? (
            <Button onClick={handleSendInvites} disabled={sending} className="gap-2">
              {sending ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                `Send ${validationResult.validEmails.length} Invitation${validationResult.validEmails.length !== 1 ? "s" : ""}`
              )}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
