"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, FileText, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { DocumentItem } from "../hooks/useDocuments";
import { getFolderRequirementStatus, type FolderRequirementStatus } from "@/lib/folders.service";

function statusClass(status?: string) {
  switch (status) {
    case "APPROVED":
      return "bg-green-100 text-green-700 border-green-300";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "REJECTED":
      return "bg-red-100 text-red-700 border-red-300";
    case "FLAGGED_FOR_REVIEW":
      return "bg-orange-100 text-orange-700 border-orange-300";
    case "UNDER_REVIEW":
      return "bg-indigo-100 text-indigo-700 border-indigo-300";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export type FolderSidePanelProps = {
  folderId?: string;
  folderName?: string;
  folderType?: string;
  folderRequiredDocumentsId?: string;
  documents: DocumentItem[];
};

export function FolderSidePanel({
  folderId,
  folderName,
  folderType,
  folderRequiredDocumentsId,
  documents,
}: FolderSidePanelProps) {
  const docs = documents || [];
  const [req, setReq] = useState<FolderRequirementStatus | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!folderId) {
        setReq(null);
        return;
      }
      try {
        const status = await getFolderRequirementStatus(folderId);
        if (active) setReq(status);
      } catch {
        if (active) setReq(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [folderId]);

  return (
    <div className="w-full sm:w-80 lg:w-96 border-l bg-white flex flex-col">
      <div className="p-3 border-b">
        <h3 className="text-sm font-semibold">Folder Documents</h3>
        {folderName ? (
          <p className="text-xs text-muted-foreground">{folderName}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Current Folder</p>
        )}
      </div>
      <ScrollArea className="flex-1">
        {docs.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">No documents in this folder</div>
        ) : (
          <ul className="p-3 space-y-2">
            {docs.map((d) => {
              const reviewStatus = d.reviews?.[0]?.status;
              return (
                <li key={d.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium truncate max-w-[180px]">{d.name}</span>
                      <span className="text-xs text-muted-foreground">{reviewStatus ?? "Unknown"}</span>
                    </div>
                  </div>
                  {reviewStatus ? (
                    <Badge variant="outline" className={`text-[10px] ${statusClass(reviewStatus)}`}>
                      {reviewStatus}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      Unknown
                    </Badge>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>

      {/* Required Documents (based on fetched status) */}
      {req && (
        <div className="border-t">
          <div className="p-3">
            <h4 className="text-sm font-semibold">Required Documents</h4>
            {req.applicable ? (
              <p className="text-xs text-muted-foreground">
                Completed {req.presentCount}/{req.totalRequired} ({req.completionPercent}%)
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">No requirement list attached.</p>
            )}
          </div>
          {req.applicable && (
            <ScrollArea className="max-h-48">
              <ul className="px-3 pb-3 space-y-2">
                {[
                  ...(req.presentTypes || []).map((t) => ({ ...t, present: true })),
                  ...(req.remainingTypes || []).map((t) => ({ ...t, present: false })),
                ].map((t) => (
                  <li
                    key={`${t.id}-${t.present ? "present" : "missing"}`}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-sm">
                      {t.name} <span className="text-muted-foreground">-</span>
                    </span>
                    {t.present ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-amber-600" />
                    )}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
}

export default FolderSidePanel;
