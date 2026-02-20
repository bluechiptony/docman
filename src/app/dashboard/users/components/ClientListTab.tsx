"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/api/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader, Plus, X, Users as UsersIcon, Building2 } from "lucide-react";
import { useAuth } from "@/providers/auth.provider";

interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  authentication?: {
    role: string;
  };
}

interface Client {
  id: string;
  name: string;
}

interface ManagerWithClients {
  manager: Manager;
  clients: Client[];
}

export function ClientListTab() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [managers, setManagers] = useState<ManagerWithClients[]>([]);
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user?.selectedOrganization) return;

    setLoading(true);
    try {
      // Fetch all managers in the organization
      const usersResponse = await apiClient.get(`/user/get/organization/${user.selectedOrganization.id}`);
      const allUsers = usersResponse.data || [];

      // Filter only managers
      const managerUsers = allUsers.filter((u: Manager) => u.authentication?.role === "MANAGER");

      // Fetch clients for each manager
      const managersWithClients = await Promise.all(
        managerUsers.map(async (manager: Manager) => {
          try {
            const clientsResponse = await apiClient.get(`/user/${manager.id}/clients`);
            return {
              manager,
              clients: clientsResponse.data || [],
            };
          } catch (error) {
            console.error(`Failed to fetch clients for manager ${manager.id}:`, error);
            return {
              manager,
              clients: [],
            };
          }
        }),
      );

      setManagers(managersWithClients);

      // Fetch all available clients
      const clientsResponse = await apiClient.get(`/clients?organizationId=${user.selectedOrganization.id}`);
      setAvailableClients(clientsResponse.data || []);
    } catch (error: any) {
      console.error("Failed to fetch managers and clients:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClient = async () => {
    if (!selectedManagerId || !selectedClientId) {
      toast.error("Please select both a manager and a client");
      return;
    }

    setAssigning(true);
    try {
      await apiClient.post(`/user/${selectedManagerId}/clients/${selectedClientId}`);
      toast.success("Client assigned successfully");
      setSelectedManagerId("");
      setSelectedClientId("");
      fetchData(); // Refresh the list
    } catch (error: any) {
      console.error("Failed to assign client:", error);
      const message = error.response?.data?.message || "Failed to assign client";
      toast.error(message);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveClient = async (managerId: string, clientId: string) => {
    try {
      await apiClient.delete(`/user/${managerId}/clients/${clientId}`);
      toast.success("Client removed successfully");
      fetchData(); // Refresh the list
    } catch (error: any) {
      console.error("Failed to remove client:", error);
      toast.error(error.response?.data?.message || "Failed to remove client");
    }
  };

  const filteredManagers = managers.filter((m) => {
    const fullName = `${m.manager.firstName} ${m.manager.lastName}`.toLowerCase();
    const searchLower = search.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      m.manager.emailAddress.toLowerCase().includes(searchLower) ||
      m.clients.some((c) => c.name.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (managers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <UsersIcon className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Managers Found</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            There are no users with the MANAGER role in this organization yet. Create a user with the MANAGER role to
            assign clients.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Assign Client Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Assign Client to Manager
          </CardTitle>
          <CardDescription>Select a manager and client to create an assignment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Manager</label>
              <Select value={selectedManagerId} onValueChange={setSelectedManagerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
                <SelectContent>
                  {managers.map((m) => (
                    <SelectItem key={m.manager.id} value={m.manager.id}>
                      {m.manager.firstName} {m.manager.lastName} ({m.manager.emailAddress})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Client</label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {availableClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAssignClient} disabled={assigning || !selectedManagerId || !selectedClientId}>
              {assigning ? "Assigning..." : "Assign"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manager Client Assignments</CardTitle>
              <CardDescription>View and manage client assignments for managers</CardDescription>
            </div>
            <Input
              placeholder="Search managers or clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredManagers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Building2 className="w-10 h-10 mb-3" />
              <p className="text-sm">No results found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Manager</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Assigned Clients</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredManagers.map((item) => (
                  <TableRow key={item.manager.id}>
                    <TableCell className="font-medium">
                      {item.manager.firstName} {item.manager.lastName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.manager.emailAddress}</TableCell>
                    <TableCell>
                      {item.clients.length === 0 ? (
                        <span className="text-sm text-muted-foreground italic">No clients assigned</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {item.clients.map((client) => (
                            <Badge key={client.id} variant="secondary" className="gap-1">
                              {client.name}
                              <button
                                onClick={() => handleRemoveClient(item.manager.id, client.id)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{item.clients.length} clients</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
