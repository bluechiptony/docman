"use client";

import React, { useMemo, useState } from "react";
import DocumentDrawer from "@/app/dashboard/documents/components/DocumentDrawer";
import { Input } from "@/components/ui/input";
import TablePaginationControls from "@/components/common/TablePaginationControls";

interface Doc {
  id: string;
  name: string;
  mimeType?: string;
  createdAt?: string;
}

interface Props {
  documents: Doc[];
}

export default function UserDocumentsList({ documents }: Props) {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const handleOpen = (docId: string) => {
    setSelectedDocId(docId);
    setDrawerOpen(true);
  };

  const handleClose = () => {
    setDrawerOpen(false);
    setSelectedDocId(null);
  };

  const filtered = useMemo(() => {
    if (!documents) return [];
    const query = search.trim().toLowerCase();
    if (!query) return documents;
    return documents.filter(
      (d) => d.name.toLowerCase().includes(query) || (d.mimeType ? d.mimeType.toLowerCase().includes(query) : false),
    );
  }, [documents, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);

  if (!documents || documents.length === 0) {
    return <div className="text-muted-foreground">No documents uploaded</div>;
  }

  return (
    <div className="mt-4 border rounded-md bg-white">
      <div className="flex flex-col gap-3 p-4 border-b">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-sm"
          />
          <div className="text-sm text-muted-foreground">
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-2 font-medium text-gray-600">Name</th>
            <th className="text-left px-4 py-2 font-medium text-gray-600">Type</th>
            <th className="text-left px-4 py-2 font-medium text-gray-600">Uploaded</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {pageItems.map((d) => (
            <tr
              key={d.id}
              className="hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleOpen(d.id)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleOpen(d.id);
                }
              }}
            >
              <td className="px-4 py-3 font-medium text-gray-800">{d.name}</td>
              <td className="px-4 py-3 text-gray-600">{d.mimeType || "—"}</td>
              <td className="px-4 py-3 text-gray-600">{d.createdAt ? new Date(d.createdAt).toLocaleString() : ""}</td>
            </tr>
          ))}
          {pageItems.length === 0 && (
            <tr>
              <td className="px-4 py-6 text-sm text-muted-foreground" colSpan={3}>
                No matching documents
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="p-4 border-t">
        <TablePaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <DocumentDrawer open={drawerOpen} onClose={handleClose} documentId={selectedDocId} />
    </div>
  );
}
