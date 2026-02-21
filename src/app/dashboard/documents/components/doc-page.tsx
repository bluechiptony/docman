"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Plus, FolderPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toaster, toast } from "sonner";
import { DocumentsGrid } from "./DocumentsGrid";
import FolderSidePanel from "./FolderSidePanel";
import UploadModal from "./UploadModal";
import CreateFolderModal from "./CreateFolderModal";
import { FolderBreadcrumb } from "./FolderBreadcrumb";
import { useDocuments } from "../hooks/useDocuments";
import { clientsApi, type Client } from "@/api/clients";
import { useAuthUser } from "@/providers/auth.provider";

export default function DocumentsPage() {
  const router = useRouter();
  const { user } = useAuthUser();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");

  const {
    path,
    visibleItems,
    documents,
    createFolder,
    openFolder,
    navigateToFolder,
    goBackTo,
    moveItem,
    handleUpload,
    addDocument,
  } = useDocuments();
  const currentFolderId = path[path.length - 1]?.id ?? null;
  const parentFolderId = path.length > 0 ? path[path.length - 1].id : undefined;
  const selectedOrgId = user?.selectedOrganization?.id ?? user?.organizations?.[0]?.id;

  useEffect(() => {
    if (!folderId) return;
    navigateToFolder(folderId);
    router.replace("/dashboard/documents");
  }, [folderId, navigateToFolder, router]);

  useEffect(() => {
    if (!selectedOrgId) {
      setClients([]);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const data = await clientsApi.getByOrganization(selectedOrgId);
        if (!cancelled) {
          setClients(data || []);
        }
      } catch (error) {
        console.error("Failed to load clients:", error);
        if (!cancelled) {
          toast.error("Failed to load clients");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedOrgId]);

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId) || null,
    [clients, selectedClientId],
  );

  const selectedClientFolderIds = useMemo(() => {
    if (!selectedClient) return new Set<string>();
    return new Set((selectedClient.folders || []).map((folder) => folder.id));
  }, [selectedClient]);

  useEffect(() => {
    if (selectedClientId === "all") return;
    if (!currentFolderId) return;
    if (selectedClientFolderIds.has(currentFolderId)) return;
    goBackTo(null);
  }, [selectedClientId, currentFolderId, selectedClientFolderIds, goBackTo]);

  // console.log(parentFolderId);
  // console.log(path);

  /** 🔴 Handle Delete */
  const handleDelete = (id: string) => {
    toast.warning("Item deleted");
  };

  /** 📁 New Folder */
  const handleNewFolder = () => {
    setIsCreateFolderOpen(true);
  };

  const clientFilteredItems = useMemo(() => {
    if (selectedClientId === "all") return visibleItems;

    if (!currentFolderId) {
      return visibleItems.filter((item) => item.type === "folder" && selectedClientFolderIds.has(item.id));
    }

    if (!selectedClientFolderIds.has(currentFolderId)) {
      return [];
    }

    return visibleItems;
  }, [currentFolderId, selectedClientId, selectedClientFolderIds, visibleItems]);

  /** 🔍 Filter documents by name */
  const filteredItems = clientFilteredItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6 h-full">
      <FolderBreadcrumb path={path} onNavigate={goBackTo} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-2xl font-semibold">{path.length === 0 ? "Documents" : path[path.length - 1].name}</h1>
        <div className="flex gap-2">
          <Button onClick={handleNewFolder} variant="outline" size="sm">
            <FolderPlus className="mr-2 h-4 w-4" /> New Folder
          </Button>
          <Button onClick={() => setIsUploadOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" /> Upload
          </Button>
        </div>
      </div>

      {/* 🔍 Search Bar + Client Filter */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search documents..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedClientId} onValueChange={setSelectedClientId}>
          <SelectTrigger className="w-full md:w-60">
            <SelectValue placeholder="Filter by client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All clients</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main area with side panel */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          <div className="flex-1 overflow-y-auto">
            <DocumentsGrid
              items={filteredItems}
              onFolderOpen={openFolder}
              onMove={moveItem}
              onDelete={handleDelete}
              onRename={(id: string, newName: string) => {
                console.log("Rename", id, newName);
              }}
              onShare={(id: string) => {
                console.log("Share", id);
                return "";
              }}
              onOpenCreateFolder={() => setIsCreateFolderOpen(true)}
              onOpenUpload={() => setIsUploadOpen(true)}
            />
          </div>
          {/* Side panel shows when inside a folder (not root) */}
          {currentFolderId &&
            (() => {
              const folderItem = documents.find((d) => d.id === currentFolderId && d.type === "folder");
              return (
                <FolderSidePanel
                  folderId={currentFolderId ?? undefined}
                  folderName={path[path.length - 1]?.name}
                  folderType={folderItem?.folderType}
                  folderRequiredDocumentsId={folderItem?.folderRequiredDocumentsId}
                  documents={visibleItems.filter((i) => i.type === "file")}
                />
              );
            })()}
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        currentFolderId={currentFolderId}
        onUploadComplete={(fileName, fileUrl) => {
          addDocument(fileName, fileUrl);
        }}
      />

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        parentFolderId={parentFolderId ? parentFolderId : undefined}
        onClose={() => setIsCreateFolderOpen(false)}
        onCreateFolder={(folderName, parentFolderId, type, folderRequiredDocumentsId) => {
          createFolder(folderName, parentFolderId, type, folderRequiredDocumentsId);
        }}
      />

      <Toaster richColors position="top-right" />
    </div>
  );
}
