"use client";

import { useCallback, useState, useEffect, useMemo } from "react";
import { apiClient } from "@/api/client";
import { toast } from "sonner";
import TablePaginationControls from "@/components/common/TablePaginationControls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronsUpDown, Loader, Plus, X, Users as UsersIcon, Building2 } from "lucide-react";
import { useAuth } from "@/providers/auth.provider";
import { cn } from "@/lib/utils";

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

interface SearchableOption {
  value: string;
  label: string;
  searchValue: string;
}

interface SearchableDropdownProps {
  value: string;
  options: SearchableOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  disabled?: boolean;
  onValueChange: (value: string) => void;
}

function SearchableDropdown({
  value,
  options,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabled,
  onValueChange,
}: SearchableDropdownProps) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className={cn("truncate", !selectedOption && "text-muted-foreground")}>
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.searchValue}
                  onSelect={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                  <span className="truncate">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return (error as { response?: { data?: { message?: string } } }).response?.data?.message ?? fallback;
}

export function ClientListTab() {
  const pageSize = 10;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [managers, setManagers] = useState<ManagerWithClients[]>([]);
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const organizationId = user?.selectedOrganization?.id;

  const fetchData = useCallback(async () => {
    if (!organizationId) {
      setManagers([]);
      setAvailableClients([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const usersResponse = await apiClient.get(`/user/get/organization/${organizationId}`);
      const allUsers = usersResponse.data || [];

      const managerUsers = allUsers.filter((u: Manager) => u.authentication?.role === "MANAGER");

      const managersWithClients = await Promise.all(
        managerUsers.map(async (manager: Manager) => {
          try {
            const clientsResponse = await apiClient.get(`/user/${manager.id}/clients`);
            return {
              manager,
              clients: clientsResponse.data || [],
            };
          } catch {
            return {
              manager,
              clients: [],
            };
          }
        }),
      );

      setManagers(managersWithClients);

      const clientsResponse = await apiClient.get(`/clients?organizationId=${organizationId}`);
      setAvailableClients(clientsResponse.data?.data || []);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load data"));
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

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
      await fetchData();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to assign client"));
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveClient = async (managerId: string, clientId: string) => {
    try {
      await apiClient.delete(`/user/${managerId}/clients/${clientId}`);
      toast.success("Client removed successfully");
      await fetchData();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to remove client"));
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

  const totalPages = Math.max(1, Math.ceil(filteredManagers.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedManagers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredManagers.slice(start, start + pageSize);
  }, [filteredManagers, page]);

  const managerOptions = useMemo<SearchableOption[]>(
    () =>
      managers.map(({ manager }) => {
        const fullName = `${manager.firstName} ${manager.lastName}`.trim();
        return {
          value: manager.id,
          label: `${fullName} (${manager.emailAddress})`,
          searchValue: `${fullName} ${manager.emailAddress}`,
        };
      }),
    [managers],
  );

  const clientOptions = useMemo<SearchableOption[]>(
    () =>
      availableClients.map((client) => ({
        value: client.id,
        label: client.name,
        searchValue: `${client.name} ${client.id}`,
      })),
    [availableClients],
  );

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Assign Client to Manager
          </CardTitle>
          <CardDescription>Select a manager and client to create an assignment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid items-end gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <div className="min-w-0">
              <label className="text-sm font-medium mb-2 block">Manager</label>
              <SearchableDropdown
                value={selectedManagerId}
                options={managerOptions}
                placeholder="Select a manager"
                searchPlaceholder="Search managers by name or email..."
                emptyMessage="No manager found."
                disabled={assigning}
                onValueChange={setSelectedManagerId}
              />
            </div>

            <div className="min-w-0">
              <label className="text-sm font-medium mb-2 block">Client</label>
              <SearchableDropdown
                value={selectedClientId}
                options={clientOptions}
                placeholder="Select a client"
                searchPlaceholder="Search clients by name..."
                emptyMessage="No client found."
                disabled={assigning}
                onValueChange={setSelectedClientId}
              />
            </div>

            <Button onClick={handleAssignClient} disabled={assigning || !selectedManagerId || !selectedClientId}>
              {assigning ? "Assigning..." : "Assign"}
            </Button>
          </div>
        </CardContent>
      </Card>

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
            <>
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
                  {paginatedManagers.map((item) => (
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

              <div className="pt-4">
                <TablePaginationControls
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  showWhenSinglePage
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
