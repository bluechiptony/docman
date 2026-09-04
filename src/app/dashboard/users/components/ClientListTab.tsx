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
import { Check, ChevronsUpDown, Loader, Plus, X, Building2 } from "lucide-react";
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

interface ManagerAssignmentsResponse {
  data: ManagerWithClients[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
  };
}

interface SearchableOption {
  value: string;
  label: string;
  searchValue: string;
}

interface SearchableDropdownProps {
  value: string;
  options: SearchableOption[];
  selectedOptionFallback?: SearchableOption | null;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  disabled?: boolean;
  searchValue?: string;
  searching?: boolean;
  onSearchChange?: (value: string) => void;
  onValueChange: (value: string) => void;
}

function SearchableDropdown({
  value,
  options,
  selectedOptionFallback,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabled,
  searchValue,
  searching,
  onSearchChange,
  onValueChange,
}: SearchableDropdownProps) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value) ?? selectedOptionFallback;

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) onSearchChange?.("");
      }}
    >
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
        <Command shouldFilter={!onSearchChange}>
          <CommandInput placeholder={searchPlaceholder} value={searchValue} onValueChange={onSearchChange} />
          <CommandList>
            <CommandEmpty>
              {searching ? (
                <span className="inline-flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  Searching...
                </span>
              ) : (
                emptyMessage
              )}
            </CommandEmpty>
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
  const [selectedManagerOption, setSelectedManagerOption] = useState<SearchableOption | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  const [search, setSearch] = useState("");
  const [managerSearch, setManagerSearch] = useState("");
  const [managerSearchResults, setManagerSearchResults] = useState<SearchableOption[] | null>(null);
  const [managerSearching, setManagerSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [totalManagers, setTotalManagers] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const organizationId = user?.selectedOrganization?.id;

  const fetchData = useCallback(async () => {
    if (!organizationId) {
      setManagers([]);
      setTotalManagers(0);
      setAvailableClients([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [managersResponse, clientsResponse] = await Promise.all([
        apiClient.get<ManagerAssignmentsResponse>("/user/manager-assignments", {
          params: {
            organizationId,
            page,
            size: pageSize,
            q: debouncedSearch || undefined,
          },
        }),
        apiClient.get(`/clients?organizationId=${organizationId}`),
      ]);

      setManagers(managersResponse.data.data);
      setTotalManagers(managersResponse.data.pagination.total);
      setAvailableClients(clientsResponse.data?.data || []);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load data"));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, organizationId, page]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
    setSearch("");
    setDebouncedSearch("");
  }, [organizationId]);

  useEffect(() => {
    const query = managerSearch.trim();
    if (!query || !organizationId) {
      setManagerSearchResults(null);
      setManagerSearching(false);
      return;
    }

    let cancelled = false;
    setManagerSearchResults([]);
    setManagerSearching(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await apiClient.get<Array<{ id: string; name: string; email: string }>>(
          "/user/search/managers",
          {
            params: {
              organizationId,
              q: query,
              limit: 25,
            },
          },
        );

        if (cancelled) return;
        setManagerSearchResults(
          response.data.map((manager) => ({
            value: manager.id,
            label: `${manager.name} (${manager.email})`,
            searchValue: `${manager.name} ${manager.email}`,
          })),
        );
      } catch (error: unknown) {
        if (!cancelled) {
          setManagerSearchResults([]);
          toast.error(getErrorMessage(error, "Failed to search managers"));
        }
      } finally {
        if (!cancelled) setManagerSearching(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [managerSearch, organizationId]);

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
      setSelectedManagerOption(null);
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

  const totalPages = Math.max(1, Math.ceil(totalManagers / pageSize));

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

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
                options={managerSearchResults ?? managerOptions}
                selectedOptionFallback={selectedManagerOption}
                placeholder="Select a manager"
                searchPlaceholder="Search managers by name or email..."
                emptyMessage="No manager found."
                disabled={assigning}
                searchValue={managerSearch}
                searching={managerSearching}
                onSearchChange={setManagerSearch}
                onValueChange={(managerId) => {
                  const option = (managerSearchResults ?? managerOptions).find(
                    (manager) => manager.value === managerId,
                  );
                  setSelectedManagerId(managerId);
                  setSelectedManagerOption(option ?? null);
                  setManagerSearch("");
                }}
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
          {managers.length === 0 ? (
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
                  {managers.map((item) => (
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
