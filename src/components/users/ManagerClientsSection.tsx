"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader, Trash2, Plus, Building2 } from "lucide-react";
import { apiClient } from "@/api/client";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
}

interface ManagerClientsSectionProps {
  userId: string;
  organizationId: string;
  userName: string;
}

export function ManagerClientsSection({ userId, organizationId, userName }: ManagerClientsSectionProps) {
  const [assignedClients, setAssignedClients] = useState<Client[]>([]);
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  useEffect(() => {
    fetchClientsData();
  }, [userId, organizationId]);

  const fetchClientsData = async () => {
    setLoading(true);
    try {
      // Fetch manager's assigned clients
      const assignedResponse = await apiClient.get(`/user/${userId}/clients`);
      setAssignedClients(assignedResponse.data || []);

      // Fetch all clients in the organization
      const allClientsResponse = await apiClient.get(`/clients?organizationId=${organizationId}`);
      const allClients = allClientsResponse.data?.data || [];

      // Filter to get unassigned clients
      const assignedIds = new Set((assignedResponse.data || []).map((c: Client) => c.id));
      const unassigned = allClients.filter((c: Client) => !assignedIds.has(c.id));
      setAvailableClients(unassigned);
      setSelectedClientId("");
    } catch (error: any) {
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClient = async () => {
    if (!selectedClientId) {
      toast.error("Please select a client");
      return;
    }

    setAssigning(true);
    try {
      await apiClient.post(`/user/${userId}/clients/${selectedClientId}`);
      toast.success("Client assigned successfully");
      await fetchClientsData();
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to assign client";
      toast.error(message);
    } finally {
      setAssigning(false);
    }
  };

  const handleDeassignClient = async (clientId: string) => {
    if (!confirm("Remove this client assignment?")) return;

    try {
      await apiClient.delete(`/user/${userId}/clients/${clientId}`);
      toast.success("Client removed successfully");
      await fetchClientsData();
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to remove client";
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assigned Clients</CardTitle>
          <CardDescription>Clients managed by {userName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assigned Clients</CardTitle>
        <CardDescription>Clients managed by {userName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Assigned Clients List */}
        <div className="space-y-2">
          {assignedClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Building2 className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">No clients assigned yet</p>
              <p className="text-xs text-muted-foreground">
                {availableClients.length > 0
                  ? "Select a client from the dropdown below to get started"
                  : "No clients available in this organization"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {assignedClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <Badge variant="outline">{client.name}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeassignClient(client.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assign New Client */}
        <div className="pt-4 border-t space-y-3">
          <div className="text-sm font-medium">Assign New Client</div>
          {availableClients.length > 0 ? (
            <div className="flex gap-2">
              <Select value={selectedClientId} onValueChange={setSelectedClientId} disabled={assigning}>
                <SelectTrigger className="flex-1">
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
              <Button onClick={handleAssignClient} disabled={assigning || !selectedClientId} className="gap-2">
                {assigning ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Assign
              </Button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4">
              {assignedClients.length > 0
                ? "All available clients have been assigned to this manager."
                : "No clients exist in this organization. Create clients from the Clients page to assign them."}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
