"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import FolderExshareDialog from "@/components/documents/FolderExshareDialog";
import TablePaginationControls from "@/components/common/TablePaginationControls";
import { Loader, Plus, Share2, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { clientsApi, Client } from "@/api/clients";
import { apiClient } from "@/api/client";
import { useAuthUser } from "@/providers/auth.provider";
import { useClientPageAccess } from "@/hooks/useClientPageAccess";
import { useRouter } from "next/navigation";

interface FolderOption {
  id: string;
  name: string;
}

export default function ClientsPage() {
  const router = useRouter();
  const { user } = useAuthUser();
  const { hasAccess, loading: checkingAccess, isManager } = useClientPageAccess();
  const [clients, setClients] = useState<Client[]>([]);
  const [folders, setFolders] = useState<FolderOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [total, setTotal] = useState(0);

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [creating, setCreating] = useState(false);

  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [clientShareTarget, setClientShareTarget] = useState<{ clientId: string; clientName: string } | null>(null);
  const [clientShareOpen, setClientShareOpen] = useState(false);

  const organizationId = user?.selectedOrganization?.id ?? user?.organizations?.[0]?.id;

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    const query = search.toLowerCase();
    return clients.filter((client) => client.name.toLowerCase().includes(query));
  }, [clients, search]);

  useEffect(() => {
    if (!organizationId) {
      setClients([]);
      setFolders([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function loadData() {
      setLoading(true);
      try {
        const [clientData, folderData] = await Promise.all([
          clientsApi.getByOrganization(organizationId, page, perPage),
          apiClient.get("/folders/get/all", { params: { orgId: organizationId } }).then((res) => res.data),
        ]);
        if (!cancelled) {
          setClients(clientData?.data || []);
          setTotal(clientData?.pagination?.total || 0);
          setFolders(
            (folderData || []).map((folder: any) => ({
              id: folder.id,
              name: folder.name,
            })),
          );
        }
      } catch (error) {
        console.error("Failed to load clients data:", error);
        if (!cancelled) {
          toast.error("Failed to load clients");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [organizationId, page, perPage]);

  const refreshClients = async () => {
    if (!organizationId) return;
    try {
      const clientData = await clientsApi.getByOrganization(organizationId, page, perPage);
      setClients(clientData?.data || []);
      setTotal(clientData?.pagination?.total || 0);
    } catch (error) {
      console.error("Failed to refresh clients:", error);
    }
  };

  const handleCreateClient = async () => {
    if (!createName.trim()) {
      toast.error("Client name is required");
      return;
    }

    if (!organizationId) {
      toast.error("Select an organization first");
      return;
    }

    setCreating(true);
    try {
      await clientsApi.create({
        name: createName.trim(),
        organizationId,
      });
      toast.success("Client created");
      setCreateName("");
      setCreateOpen(false);
      if (page === 1) {
        await refreshClients();
      }
      setPage(1);
    } catch (error: any) {
      console.error("Failed to create client:", error);
      const message = error.response?.data?.message || "Failed to create client";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleOpenAssign = (client: Client) => {
    setSelectedClient(client);
    setSelectedFolderIds(client.folders.map((folder) => folder.id));
    setAssignOpen(true);
  };

  const handleToggleFolder = (folderId: string) => {
    setSelectedFolderIds((prev) =>
      prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId],
    );
  };

  const handleSaveAssignments = async () => {
    if (!selectedClient) return;
    setAssigning(true);
    try {
      await clientsApi.updateFolders(selectedClient.id, { folderIds: selectedFolderIds });
      toast.success("Client folders updated");
      setAssignOpen(false);
      setSelectedClient(null);
      await refreshClients();
    } catch (error: any) {
      console.error("Failed to update folders:", error);
      const message = error.response?.data?.message || "Failed to update folders";
      toast.error(message);
    } finally {
      setAssigning(false);
    }
  };

  if (checkingAccess) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-[#0A3A5C]" />
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 h-full p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clients</h1>
          <p className="text-sm text-muted-foreground">Create clients and assign folders</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/help/admin/clients" className="inline-flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Help
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-sm"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows</span>
            <Select
              value={String(perPage)}
              onValueChange={(value) => {
                setPerPage(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {!isManager && (
          <Button onClick={() => setCreateOpen(true)} className="gap-2" size="sm">
            <Plus className="w-4 h-4" />
            Create Client
          </Button>
        )}
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Folders</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Created</th>
              <th className="text-right px-4 py-2 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                  Loading clients...
                </td>
              </tr>
            ) : filteredClients.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-400">
                  No clients found
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <ContextMenu key={client.id}>
                  <ContextMenuTrigger asChild>
                    <tr
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">{client.name}</td>
                      <td className="px-4 py-3 text-gray-600">{client.folders.length ? client.folders.length : "—"}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!isManager && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAssign(client);
                            }}
                          >
                            Assign folders
                          </Button>
                        )}
                      </td>
                    </tr>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      onClick={() => {
                        setClientShareTarget({ clientId: client.id, clientName: client.name });
                        setClientShareOpen(true);
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-2" /> Share via Email (Exshare)
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TablePaginationControls
        currentPage={page}
        totalPages={Math.ceil(total / perPage)}
        onPageChange={setPage}
        size="default"
        showWhenSinglePage
      />

      <FolderExshareDialog
        open={clientShareOpen}
        onClose={() => {
          setClientShareOpen(false);
          setClientShareTarget(null);
        }}
        organizationId={organizationId ?? ""}
        target={
          clientShareTarget
            ? {
                type: "client",
                clientId: clientShareTarget.clientId,
                clientName: clientShareTarget.clientName,
              }
            : null
        }
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              placeholder="Acme Corp"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !creating) {
                  handleCreateClient();
                }
              }}
              disabled={creating}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button onClick={handleCreateClient} disabled={creating}>
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={assignOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAssignOpen(false);
            setSelectedClient(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedClient ? `Assign folders to ${selectedClient.name}` : "Assign folders"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Select the folders that belong to this client. Unchecked folders will be removed.
            </p>
            <ScrollArea className="h-64 rounded-md border p-3">
              {folders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No folders available.</p>
              ) : (
                <div className="space-y-3">
                  {folders.map((folder) => (
                    <label key={folder.id} className="flex items-center gap-3 text-sm">
                      <Checkbox
                        checked={selectedFolderIds.includes(folder.id)}
                        onCheckedChange={() => handleToggleFolder(folder.id)}
                        disabled={assigning}
                      />
                      <span>{folder.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)} disabled={assigning}>
              Cancel
            </Button>
            <Button onClick={handleSaveAssignments} disabled={assigning}>
              {assigning ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
