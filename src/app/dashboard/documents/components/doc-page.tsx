"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Plus, FolderPlus, Search, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Toaster, toast } from "sonner";
import { DocumentsGrid } from "./DocumentsGrid";
import FolderSidePanel from "./FolderSidePanel";
import UploadModal from "./UploadModal";
import CreateFolderModal from "./CreateFolderModal";
import { FolderBreadcrumb } from "./FolderBreadcrumb";
import { useDocuments } from "../hooks/useDocuments";
import { clientsApi, type Client } from "@/api/clients";
import { useAuthUser } from "@/providers/auth.provider";
import { apiClient } from "@/api/client";

type DocumentCategoryGroup = {
  id: string;
  name: string;
  documentCount: number;
};

export default function DocumentsPage() {
  const router = useRouter();
  const { user } = useAuthUser();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [categorySort, setCategorySort] = useState<"name" | "count">("count");
  const [currentFolder, setCurrentFolder] = useState<{
    folderType?: string;
    folderRequiredDocumentsId?: string;
  } | null>(null);
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");

  const role = user?.authentication?.role;
  const canManage = role === "SUPER_ADMIN" || role === "ADMINISTRATOR" || role === "MANAGER";
  const canManageUploads = role === "SUPER_ADMIN" || role === "ADMINISTRATOR" || role === "MANAGER" || role === "USER";

  const { path, visibleItems, createFolder, openFolder, navigateToFolder, goBackTo, moveItem, addDocument } =
    useDocuments();
  const currentFolderId = path[path.length - 1]?.id ?? null;
  const currentPathEntry = path[path.length - 1] ?? null;
  const parentFolderId = path[path.length - 1]?.id ?? undefined;
  const selectedOrgId = user?.selectedOrganization?.id ?? user?.organizations?.[0]?.id;

  const folderTitle = useMemo(() => {
    if (!currentPathEntry) {
      return "Documents";
    }

    if (currentPathEntry.id === null) {
      return currentPathEntry.name;
    }

    if (currentPathEntry.folderType === "STAFF" && currentPathEntry.staff) {
      const fullName = [
        currentPathEntry.staff.firstName,
        currentPathEntry.staff.otherName,
        currentPathEntry.staff.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      if (fullName && currentPathEntry.staff.staffId) {
        return `${fullName} (${currentPathEntry.staff.staffId})`;
      }

      if (fullName) {
        return fullName;
      }

      if (currentPathEntry.staff.staffId) {
        return `Staff (${currentPathEntry.staff.staffId})`;
      }
    }

    return currentPathEntry.name;
  }, [currentPathEntry]);

  useEffect(() => {
    if (!folderId) return;
    navigateToFolder(folderId);
    router.replace("/dashboard/documents");
  }, [folderId, navigateToFolder, router]);

  useEffect(() => {
    if (!selectedOrgId || !canManage) {
      setClients([]);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const data = await clientsApi.getByOrganization(selectedOrgId);
        if (!cancelled) {
          setClients(data?.data || []);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error("Failed to load clients");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedOrgId, canManage, canManageUploads]);

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

  useEffect(() => {
    setSelectedCategoryId("all");
  }, [currentFolderId]);

  /** 🔴 Handle Delete */
  const handleDelete = (_id: string) => {
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

  const isStaffFolder = currentFolder?.folderType === "STAFF";

  // Fetch current folder details when currentFolderId changes
  useEffect(() => {
    if (!currentFolderId) {
      setCurrentFolder(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const response = await apiClient.get(`/folders/${currentFolderId}/requirements/status`);
        if (!cancelled) {
          setCurrentFolder({
            folderType: response.data?.folderType,
            folderRequiredDocumentsId: response.data?.listId ?? undefined,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setCurrentFolder(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentFolderId]);

  const categoryGroups = useMemo<DocumentCategoryGroup[]>(() => {
    const groups = new Map<string, DocumentCategoryGroup>();

    clientFilteredItems.forEach((item) => {
      if (item.type !== "file") {
        return;
      }

      const categoryId = item.documentType?.category?.id ?? "uncategorized";
      const categoryName = item.documentType?.category?.name ?? "Uncategorized";
      const existing = groups.get(categoryId) ?? {
        id: categoryId,
        name: categoryName,
        documentCount: 0,
      };

      existing.documentCount += 1;
      groups.set(categoryId, existing);
    });

    return Array.from(groups.values());
  }, [clientFilteredItems]);

  const categoryFilterOptions = useMemo(
    () => categoryGroups.map((group) => ({ id: group.id, name: group.name })),
    [categoryGroups],
  );

  const sortedCategoryGroups = useMemo(() => {
    return [...categoryGroups].sort((left, right) => {
      if (categorySort === "name") {
        return left.name.localeCompare(right.name);
      }

      if (right.documentCount !== left.documentCount) {
        return right.documentCount - left.documentCount;
      }

      return left.name.localeCompare(right.name);
    });
  }, [categoryGroups, categorySort]);

  /** 🔍 Filter by name and category (files only) */
  const filteredItems = clientFilteredItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (!isStaffFolder || selectedCategoryId === "all" || item.type === "folder") {
      return true;
    }

    const categoryId = item.documentType?.category?.id ?? "uncategorized";
    return categoryId === selectedCategoryId;
  });

  return (
    <div className="flex flex-col gap-6 h-full">
      <FolderBreadcrumb path={path} onNavigate={goBackTo} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-2xl font-semibold">{folderTitle}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/help/user/documents" className="inline-flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Help
            </Link>
          </Button>
          {canManage && (
            <Button onClick={handleNewFolder} variant="outline" size="sm">
              <FolderPlus className="mr-2 h-4 w-4" /> New Folder
            </Button>
          )}
          {canManageUploads && (
            <Button onClick={() => setIsUploadOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Upload
            </Button>
          )}
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
        {canManage && (
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
        )}
      </div>

      {isStaffFolder && (
        <div className="space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm font-medium text-gray-700">Document Categories</div>
            <div className="flex flex-col gap-3 md:flex-row">
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger className="w-full md:w-72">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categoryFilterOptions.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={categorySort} onValueChange={(value) => setCategorySort(value as "name" | "count")}>
                <SelectTrigger className="w-full md:w-56">
                  <SelectValue placeholder="Sort categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="count">Sort by document count</SelectItem>
                  <SelectItem value="name">Sort by name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {sortedCategoryGroups.length > 0 && (
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3">
              <button
                type="button"
                onClick={() => setSelectedCategoryId("all")}
                className={`rounded-lg border p-3 text-left transition ${
                  selectedCategoryId === "all"
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium text-gray-900">All categories</div>
                  <Badge variant="outline" className="border-gray-300 text-gray-700">
                    {categoryGroups.length}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Show every document in this staff folder</p>
              </button>

              {sortedCategoryGroups.map((group) => {
                const categoryId = group.id;
                return (
                  <button
                    key={categoryId}
                    type="button"
                    onClick={() => setSelectedCategoryId(categoryId)}
                    className={`rounded-lg border p-3 text-left transition ${
                      selectedCategoryId === categoryId
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{group.name}</div>
                        <p className="mt-1 text-xs text-muted-foreground">{group.documentCount} uploaded documents</p>
                      </div>
                      <Badge variant="outline" className="border-gray-300 text-gray-700">
                        {group.documentCount}
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Filter this folder to documents in this category
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {sortedCategoryGroups.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-muted-foreground">
              No document categories found for the uploaded documents in this folder.
            </div>
          )}
        </div>
      )}

      {/* Main area with side panel */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          <div className="flex-1 overflow-y-auto">
            <DocumentsGrid
              items={filteredItems}
              organizationId={selectedOrgId ?? ""}
              onFolderOpen={openFolder}
              onMove={moveItem}
              onDelete={handleDelete}
              onRename={(id: string, newName: string) => {}}
              onShare={(id: string) => {
                return "";
              }}
              onOpenCreateFolder={() => setIsCreateFolderOpen(true)}
              onOpenUpload={() => setIsUploadOpen(true)}
            />
          </div>
          {/* Side panel shows when inside a folder (not root) */}
          {currentFolderId &&
            (() => {
              return (
                <FolderSidePanel
                  folderId={currentFolderId ?? undefined}
                  folderName={path[path.length - 1]?.name}
                  folderType={currentFolder?.folderType}
                  folderRequiredDocumentsId={currentFolder?.folderRequiredDocumentsId}
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
        parentFolderId={parentFolderId}
        onClose={() => setIsCreateFolderOpen(false)}
        onCreateFolder={(folderName, parentFolderId, type, folderRequiredDocumentsId) => {
          createFolder(folderName, parentFolderId, type, folderRequiredDocumentsId);
        }}
      />

      <Toaster richColors position="top-right" />
    </div>
  );
}
