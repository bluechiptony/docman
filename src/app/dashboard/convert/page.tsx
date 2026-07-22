"use client";

import { ChangeEvent, DragEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  Download,
  FileOutput,
  Loader2,
  RefreshCw,
  Save,
  UploadCloud,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { conversionsApi, ConversionBatch, ConversionFolder, ConversionType } from "@/api/conversions";
import { useAuthUser } from "@/providers/auth.provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PendingFile = {
  id: string;
  file: File;
  conversionType: ConversionType;
  progress: number;
};

const ACTIVE = new Set(["DRAFT", "UPLOADING", "QUEUED", "PROCESSING"]);
const ALLOWED_ROLES = new Set(["MANAGER", "ADMINISTRATOR", "SUPER_ADMIN"]);
const MAX_BYTES = 25 * 1024 * 1024;

function optionsFor(file: File): ConversionType[] {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension === "pdf" ? ["PDF_TO_WORD"] : extension === "doc" || extension === "docx" ? ["WORD_TO_PDF", "WORD_TO_EXCEL"] : [];
}

function label(type: ConversionType) {
  return { PDF_TO_WORD: "PDF to Word", WORD_TO_PDF: "Word to PDF", WORD_TO_EXCEL: "Word to Excel" }[type];
}

function statusLabel(status: string) {
  return { UPLOADING: "Uploading", QUEUED: "Queued", PROCESSING: "Converting", COMPLETED: "Ready" }[status] || status[0] + status.slice(1).toLowerCase();
}

function expiryText(value?: string | null) {
  if (!value) return "";
  const seconds = Math.max(0, Math.floor((new Date(value).getTime() - Date.now()) / 1000));
  const minutes = Math.floor(seconds / 60);
  return seconds > 0 ? `Expires in ${minutes}m ${seconds % 60}s` : "Expired";
}

function errorMessage(error: unknown, fallback: string) {
  const apiError = error as { response?: { data?: { message?: string } }; message?: string };
  return apiError.response?.data?.message || apiError.message || fallback;
}

export default function ConvertPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthUser();
  const organizationId = user?.selectedOrganization?.id ?? user?.organizations?.[0]?.id;
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [batches, setBatches] = useState<ConversionBatch[]>([]);
  const [folders, setFolders] = useState<ConversionFolder[]>([]);
  const [busy, setBusy] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [saveJobId, setSaveJobId] = useState<string | null>(null);
  const [folderId, setFolderId] = useState("");
  const [, tick] = useState(0);
  const authorized = !!user?.authentication?.role && ALLOWED_ROLES.has(user.authentication.role);

  useEffect(() => {
    if (!isLoading && !authorized) router.replace("/dashboard");
  }, [authorized, isLoading, router]);

  const refresh = useCallback(async () => {
    if (!organizationId || !authorized) return;
    try {
      const [history, destinations] = await Promise.all([
        conversionsApi.listBatches(organizationId),
        conversionsApi.folders(organizationId),
      ]);
      setBatches(history);
      setFolders(destinations);
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Could not load conversions"));
    } finally {
      setLoadingHistory(false);
    }
  }, [authorized, organizationId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const hasActive = useMemo(() => batches.some((batch) => batch.jobs.some((job) => ACTIVE.has(job.status))), [batches]);
  useEffect(() => {
    if (!hasActive) return;
    const interval = window.setInterval(() => {
      if (!document.hidden) refresh();
    }, 5000);
    return () => window.clearInterval(interval);
  }, [hasActive, refresh]);

  useEffect(() => {
    const interval = window.setInterval(() => tick((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const addFiles = (incoming: File[]) => {
    const remaining = 10 - files.length;
    const accepted: PendingFile[] = [];
    for (const file of incoming.slice(0, remaining)) {
      const options = optionsFor(file);
      if (!options.length) {
        toast.error(`${file.name}: only PDF, DOC, and DOCX files are supported`);
      } else if (file.size > MAX_BYTES) {
        toast.error(`${file.name}: files must be 25 MB or smaller`);
      } else {
        accepted.push({ id: crypto.randomUUID(), file, conversionType: options[0], progress: 0 });
      }
    }
    if (incoming.length > remaining) toast.error("A batch can contain up to 10 files");
    setFiles((current) => [...current, ...accepted]);
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files || []));
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    addFiles(Array.from(event.dataTransfer.files));
  };

  const submit = async () => {
    if (!organizationId || !files.length) return;
    setBusy(true);
    try {
      const created = await conversionsApi.createBatch({
        organizationId,
        files: files.map((item) => ({
          clientId: item.id,
          name: item.file.name,
          mimeType: item.file.type || "application/octet-stream",
          size: item.file.size,
          conversionType: item.conversionType,
        })),
      });
      const successful: string[] = [];
      for (const target of created.uploads) {
        const item = files.find((file) => file.id === target.clientId);
        if (!item) continue;
        try {
          await conversionsApi.upload(target, item.file, (progress) =>
            setFiles((current) => current.map((file) => file.id === item.id ? { ...file, progress } : file)),
          );
          successful.push(target.jobId);
        } catch {
          toast.error(`${item.file.name} could not be uploaded`);
        }
      }
      await conversionsApi.completeBatch(created.batch.id, successful);
      if (successful.length) {
        toast.success("Conversion batch queued. You can safely leave this page.");
      } else {
        toast.error("No files were uploaded successfully");
      }
      setFiles([]);
      await refresh();
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Could not start conversion"));
    } finally {
      setBusy(false);
    }
  };

  const download = async (jobId: string) => {
    try {
      const result = await conversionsApi.download(jobId);
      window.location.assign(result.url);
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Download is no longer available"));
    }
  };

  const retry = async (jobId: string) => {
    try {
      await conversionsApi.retry(jobId);
      toast.success("Conversion queued for retry");
      refresh();
    } catch (error: unknown) {
      toast.error(errorMessage(error, "This conversion cannot be retried"));
    }
  };

  const save = async () => {
    if (!saveJobId || !folderId) return;
    try {
      await conversionsApi.save(saveJobId, folderId);
      toast.success("Converted document saved to DocMan");
      setSaveJobId(null);
      setFolderId("");
      refresh();
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Could not save the document"));
    }
  };

  if (isLoading || !authorized) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-3 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Convert documents</h1>
        <p className="text-sm text-muted-foreground">Upload up to 10 files. Processing continues while you use DocMan.</p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div onDrop={handleDrop} onDragOver={(event) => event.preventDefault()} className="rounded-lg border-2 border-dashed p-8 text-center">
            <UploadCloud className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-medium">Drop PDF or Word files here</p>
            <p className="mb-4 text-sm text-muted-foreground">25 MB maximum per file</p>
            <Button asChild variant="outline"><label className="cursor-pointer">Choose files<input type="file" multiple accept=".pdf,.doc,.docx" className="hidden" onChange={handleInput} /></label></Button>
          </div>

          {files.map((item) => (
            <div key={item.id} className="grid items-center gap-3 rounded-md border p-3 md:grid-cols-[1fr_220px_120px_36px]">
              <div className="min-w-0"><p className="truncate text-sm font-medium">{item.file.name}</p><p className="text-xs text-muted-foreground">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>{item.progress > 0 && <Progress value={item.progress} className="mt-2 h-1.5" />}</div>
              <Select value={item.conversionType} disabled={busy} onValueChange={(value: ConversionType) => setFiles((current) => current.map((file) => file.id === item.id ? { ...file, conversionType: value } : file))}>
                <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{optionsFor(item.file).map((option) => <SelectItem key={option} value={option}>{label(option)}</SelectItem>)}</SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">{item.progress ? `${item.progress}%` : "Ready"}</span>
              <Button variant="ghost" size="icon" disabled={busy} onClick={() => setFiles((current) => current.filter((file) => file.id !== item.id))}><X className="h-4 w-4" /></Button>
            </div>
          ))}
          <div className="flex justify-end"><Button disabled={busy || !files.length} onClick={submit}>{busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading</> : <><FileOutput className="mr-2 h-4 w-4" />Start conversion</>}</Button></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between"><CardTitle>Conversion history</CardTitle><Button variant="ghost" size="icon" onClick={refresh}><RefreshCw className="h-4 w-4" /></Button></CardHeader>
        <CardContent className="space-y-4">
          {loadingHistory && <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>}
          {!loadingHistory && !batches.length && <div className="py-10 text-center text-muted-foreground">No conversions yet.</div>}
          {batches.map((batch) => {
            const completed = batch.jobs.filter((job) => job.status === "COMPLETED").length;
            const failed = batch.jobs.filter((job) => job.status === "FAILED" || job.status === "EXPIRED").length;
            return <div key={batch.id} className="rounded-lg border">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-4 py-3"><div><p className="text-sm font-semibold">{batch.jobs.length} file batch</p><p className="text-xs text-muted-foreground">{new Date(batch.createdAt).toLocaleString()}</p></div><Badge variant="outline">{completed} ready · {failed} failed</Badge></div>
              <div className="divide-y">{batch.jobs.map((job) => <div key={job.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                {job.status === "COMPLETED" ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : job.status === "FAILED" || job.status === "EXPIRED" ? <XCircle className="h-5 w-5 text-red-500" /> : <Clock3 className="h-5 w-5 text-amber-500" />}
                <div className="min-w-[220px] flex-1"><p className="truncate text-sm font-medium">{job.outputName || job.sourceName}</p><p className="text-xs text-muted-foreground">{label(job.conversionType)} · {statusLabel(job.status)}{job.outputExpiresAt && !job.outputDocumentId ? ` · ${expiryText(job.outputExpiresAt)}` : ""}</p>{job.errorMessage && <p className="text-xs text-red-600">{job.errorMessage}</p>}</div>
                {job.status === "COMPLETED" && !job.outputDocumentId && <><Button size="sm" variant="outline" onClick={() => download(job.id)}><Download className="mr-1 h-4 w-4" />Download</Button><Button size="sm" onClick={() => setSaveJobId(job.id)}><Save className="mr-1 h-4 w-4" />Save to DocMan</Button></>}
                {job.outputDocumentId && <Badge>Saved</Badge>}
                {job.status === "FAILED" && <Button size="sm" variant="outline" onClick={() => retry(job.id)}><RefreshCw className="mr-1 h-4 w-4" />Retry</Button>}
              </div>)}</div>
            </div>;
          })}
        </CardContent>
      </Card>

      <Dialog open={!!saveJobId} onOpenChange={(open) => !open && setSaveJobId(null)}><DialogContent><DialogHeader><DialogTitle>Save converted document</DialogTitle></DialogHeader><Select value={folderId} onValueChange={setFolderId}><SelectTrigger><SelectValue placeholder="Choose an authorized folder" /></SelectTrigger><SelectContent>{folders.map((folder) => <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>)}</SelectContent></Select><DialogFooter><Button variant="outline" onClick={() => setSaveJobId(null)}>Cancel</Button><Button disabled={!folderId} onClick={save}>Save</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
