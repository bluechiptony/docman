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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import { clientsApi } from "@/api/clients";
import { useAuth } from "@/providers/auth.provider";
import {
  Upload,
  AlertCircle,
  CheckCircle,
  Loader,
  Download,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { parseBulkInviteFile, type BulkInviteRecord } from "./bulk-invite-file";

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
  validRecords: BulkInviteRecord[];
  invalidRecords: {
    row: number;
    record: BulkInviteRecord;
    reasons: string[];
  }[];
}

function getErrorMessage(error: unknown, fallback: string) {
  return (
    (error as { response?: { data?: { message?: string } } }).response?.data
      ?.message ?? (error instanceof Error ? error.message : fallback)
  );
}

export function BulkInviteModal({
  open,
  onClose,
  onInviteSuccess,
}: BulkInviteModalProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(
    undefined,
  );
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [validating, setValidating] = useState(false);
  const [sending, setSending] = useState(false);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);

  const organizationId = user?.selectedOrganization?.id || "";
  const isManager = user?.authentication?.role === "MANAGER";

  useEffect(() => {
    if (open && organizationId) {
      fetchClients(organizationId);
    }
  }, [open, organizationId]);

  const fetchClients = async (orgId: string) => {
    setLoadingClients(true);
    try {
      const response = await clientsApi.getByOrganization(orgId, 1, 100);
      setClients(response?.data || []);
      setSelectedClientId(undefined);
    } catch {
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const fileName = selectedFile.name.toLowerCase();
    const isCSV = fileName.endsWith(".csv");
    const isXLSX = fileName.endsWith(".xlsx");

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

    if (isManager && !selectedClientId) {
      toast.error("Please select one of your assigned clients");
      return;
    }

    setValidating(true);
    try {
      const records = await parseBulkInviteFile(file);

      if (records.length === 0) {
        toast.error("No invite records found in file");
        setValidating(false);
        return;
      }

      // Call backend to validate emails
      const response = await apiClient.post("/auth/validate-bulk-invite", {
        records,
        organizationId,
        clientId: selectedClientId,
      });

      setValidationResult(response.data);

      if (response.data.invalidRecords.length > 0) {
        toast.warning(
          `${response.data.invalidRecords.length} row(s) have issues`,
        );
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to validate records"));
    } finally {
      setValidating(false);
    }
  };

  const handleSendInvites = async () => {
    if (!validationResult || validationResult.validRecords.length === 0) {
      toast.error("No valid emails to send invitations to");
      return;
    }

    if (!organizationId) {
      toast.error("Please select an organization");
      return;
    }
    if (isManager && !selectedClientId) {
      toast.error("Please select one of your assigned clients");
      return;
    }

    setSending(true);
    try {
      await apiClient.post("/auth/send-bulk-invites", {
        records: validationResult.validRecords,
        organizationId,
        clientId: selectedClientId,
      });

      toast.success(
        `Invitations sent to ${validationResult.validRecords.length} user(s)`,
      );
      setFile(null);
      setValidationResult(null);
      setSelectedClientId(undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose();
      onInviteSuccess?.();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to send invitations"));
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
          <DialogDescription>
            Upload staff identity details from a CSV or XLSX file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Upload File (CSV or XLSX)</Label>
              <div className="flex items-center gap-3 text-xs">
                <a
                  href="/bulk-invite-template.csv"
                  download
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> CSV template
                </a>
              </div>
            </div>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx"
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
                    <p className="font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Required columns: email_address, first_name, last_name
                    </p>
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
              Assign to Client{" "}
              <span className="text-xs text-muted-foreground">
                {isManager ? "(required)" : "(optional)"}
              </span>
            </Label>
            {loadingClients ? (
              <div className="text-sm text-muted-foreground">
                Loading clients...
              </div>
            ) : (
              <Select
                value={selectedClientId || ""}
                onValueChange={(value) =>
                  setSelectedClientId(value || undefined)
                }
                disabled={
                  validating ||
                  sending ||
                  validationResult !== null ||
                  clients.length === 0
                }
              >
                <SelectTrigger id="client">
                  <SelectValue placeholder="No client selected" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {!loadingClients && isManager && clients.length === 0 ? (
              <p className="text-sm text-amber-700">
                No clients are assigned to you. Ask an administrator to assign a
                client before inviting staff.
              </p>
            ) : null}
          </div>

          {/* Validation Results */}
          {validationResult && (
            <div className="space-y-3">
              {validationResult.validRecords.length > 0 && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {validationResult.validRecords.length} valid row(s) ready to
                    invite
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.invalidRecords.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <div className="text-red-800">
                      <p className="font-medium mb-2">
                        {validationResult.invalidRecords.length} row(s) cannot
                        be invited:
                      </p>
                      <ul className="text-xs space-y-1">
                        {validationResult.invalidRecords.map((item) => (
                          <li key={item.row}>
                            Row {item.row}:{" "}
                            <span className="font-mono">
                              {item.record.email || "No email"}
                            </span>{" "}
                            — {item.reasons.join("; ")}
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
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={validating || sending}
          >
            Cancel
          </Button>

          {!validationResult ? (
            <Button
              onClick={handleValidate}
              disabled={
                !file ||
                validating ||
                !organizationId ||
                (isManager && !selectedClientId)
              }
              className="gap-2"
            >
              {validating ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Validating...
                </>
              ) : (
                "Validate Records"
              )}
            </Button>
          ) : validationResult.validRecords.length > 0 ? (
            <Button
              onClick={handleSendInvites}
              disabled={sending}
              className="gap-2"
            >
              {sending ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                `Send ${validationResult.validRecords.length} Invitation${validationResult.validRecords.length !== 1 ? "s" : ""}`
              )}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
