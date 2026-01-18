"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, FileText, FolderOpen, Loader, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/api/client";
import { toast } from "sonner";
import CreateOrganizationModal from "@/components/organizations/CreateOrganizationModal";

interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    users: number;
    documents: number;
    folders: number;
  };
}

export default function AllOrganizationsView() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchAllOrganizations();
  }, []);

  const fetchAllOrganizations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/organizations/admin/all");
      setOrganizations(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch organizations");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrganizations = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleOrganizationCreated = () => {
    toast.success("Organization created successfully");
    setShowCreateModal(false);
    fetchAllOrganizations();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-[#0A3A5C]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">All Organizations</h2>
          <p className="text-gray-600">System-wide view of all organizations</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowCreateModal(true)} className="bg-[#0A3A5C] hover:bg-[#0A3A5C]/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Organization
          </Button>
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-semibold">Super Admin View</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search organizations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Organizations</p>
                <p className="text-3xl font-bold text-gray-900">{organizations.length}</p>
              </div>
              <Building2 className="w-12 h-12 text-[#0A3A5C] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {organizations.reduce((sum, org) => sum + org._count.users, 0)}
                </p>
              </div>
              <Users className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-3xl font-bold text-gray-900">
                  {organizations.reduce((sum, org) => sum + org._count.documents, 0)}
                </p>
              </div>
              <FileText className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizations List */}
      {filteredOrganizations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchQuery ? "No organizations found matching your search" : "No organizations yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOrganizations.map((org) => (
            <Card key={org.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-6 h-6 text-[#0A3A5C]" />
                    <div>
                      <CardTitle className="text-lg">{org.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {org.slug} • Created {new Date(org.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-600">
                      <strong className="text-gray-900">{org._count.users}</strong> users
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-gray-600">
                      <strong className="text-gray-900">{org._count.documents}</strong> documents
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FolderOpen className="w-4 h-4 text-yellow-600" />
                    <span className="text-gray-600">
                      <strong className="text-gray-900">{org._count.folders}</strong> folders
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateOrganizationModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={handleOrganizationCreated}
        trigger={null}
      />
    </div>
  );
}
