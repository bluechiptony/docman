"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, ArrowLeft, FolderOpen, Users } from "lucide-react";
import { toast } from "sonner";
import { clientsApi, Client } from "@/api/clients";
import { apiClient } from "@/api/client";
import { useAuthUser } from "@/providers/auth.provider";
import { useClientPageAccess } from "@/hooks/useClientPageAccess";

interface Folder {
  id: string;
  name: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  authentication: {
    role: string;
    active: boolean;
  };
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const { user } = useAuthUser();
  const { hasAccess, loading: checkingAccess, isManager } = useClientPageAccess();

  const [client, setClient] = useState<Client | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [folderSearch, setFolderSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const filteredFolders = useMemo(() => {
    if (!folderSearch.trim()) return folders;
    const query = folderSearch.toLowerCase();
    return folders.filter(
      (folder) => folder.name.toLowerCase().includes(query) || folder.id.toLowerCase().includes(query),
    );
  }, [folders, folderSearch]);

  const filteredManagers = useMemo(() => {
    if (!userSearch.trim()) return managers;
    const query = userSearch.toLowerCase();
    return managers.filter(
      (manager) =>
        `${manager.firstName} ${manager.lastName}`.toLowerCase().includes(query) ||
        manager.emailAddress.toLowerCase().includes(query) ||
        manager.authentication.role.toLowerCase().includes(query),
    );
  }, [managers, userSearch]);

  useEffect(() => {
    if (!clientId || !hasAccess) return;

    let cancelled = false;
    async function loadData() {
      setLoading(true);
      try {
        const [clientData, managersData] = await Promise.all([
          clientsApi.getById(clientId),
          apiClient.get(`/clients/${clientId}/managers`).then((res) => res.data),
        ]);

        if (!cancelled) {
          setClient(clientData);
          setFolders(clientData.folders || []);
          setManagers(managersData || []);
        }
      } catch (error) {
        console.error("Failed to load client detail:", error);
        if (!cancelled) {
          toast.error("Failed to load client");
          router.push("/dashboard/clients");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [clientId, hasAccess, router]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-[#0A3A5C]" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 mb-4">Client not found</p>
        <Button onClick={() => router.push("/dashboard/clients")}>Back to Clients</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/clients")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{client.name}</h1>
          <p className="text-sm text-muted-foreground">
            Created on {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : "—"}
          </p>
        </div>
      </div>

      <Tabs defaultValue="folders" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="folders" className="gap-2">
            <FolderOpen className="w-4 h-4" />
            Folders
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
        </TabsList>

        {/* Folders Tab */}
        <TabsContent value="folders" className="space-y-4">
          <Input
            placeholder="Search folders..."
            value={folderSearch}
            onChange={(e) => setFolderSearch(e.target.value)}
            className="max-w-sm"
          />
          <div className="border rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Folder Name</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Folder ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFolders.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-10 text-center text-gray-400">
                      {folders.length === 0 ? "No folders assigned" : "No folders match your search"}
                    </td>
                  </tr>
                ) : (
                  filteredFolders.map((folder) => (
                    <tr
                      key={folder.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/documents?folderId=${folder.id}`)}
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">{folder.name}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs font-mono">{folder.id}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Input
            placeholder="Search users..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="max-w-sm"
          />
          <div className="border rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Role</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredManagers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-gray-400">
                      {managers.length === 0 ? "No managers assigned to this client" : "No users match your search"}
                    </td>
                  </tr>
                ) : (
                  filteredManagers.map((manager) => (
                    <tr key={manager.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {manager.firstName} {manager.lastName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{manager.emailAddress}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {manager.authentication.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            manager.authentication.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {manager.authentication.active ? "Active" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
