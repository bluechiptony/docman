"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { folderRequiredDocumentsApi, FolderRequiredDocuments } from "@/api/folder-required-documents";
import { useAuth } from "@/providers/auth.provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileStack, Loader2, FileX, ChevronRight } from "lucide-react";

interface Props {
  reloadKey?: number;
}

const FolderRequiredDocumentsList: React.FC<Props> = ({ reloadKey = 0 }) => {
  const { user } = useAuth();
  const [configs, setConfigs] = useState<FolderRequiredDocuments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchConfigs() {
      if (!user?.organizations?.[0]?.id) {
        if (!cancelled) {
          setError("No organization found");
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const organizationId = user.organizations[0]?.id;
        const data = await folderRequiredDocumentsApi.getByOrganization(organizationId);
        if (!cancelled) setConfigs(data);
      } catch (e) {
        if (!cancelled) setError("Failed to load configurations");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchConfigs();
    return () => {
      cancelled = true;
    };
  }, [reloadKey, user]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <FileX className="h-5 w-5" />
            <p className="font-medium">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (configs.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-gray-100 p-4 mb-4">
            <FileStack className="h-8 w-8 text-gray-400" />
          </div>
          <CardTitle className="text-center mb-2">No configurations found</CardTitle>
          <CardDescription className="text-center mb-4">
            Get started by creating your first folder required documents configuration.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {configs.map((config) => (
        <Card key={config.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileStack className="h-5 w-5 text-blue-600" />
                  {config.name}
                </CardTitle>
                <CardDescription className="mt-1">Required documents configuration for folders</CardDescription>
              </div>
              <Link href={`/dashboard/settings/folder/required-docs/${config.id}`}>
                <Button variant="ghost" size="sm" className="gap-1">
                  View Details
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {config.documentTypes && config.documentTypes.length > 0 ? (
                <>
                  {config.documentTypes.slice(0, 5).map((docType) => (
                    <Badge key={docType.id} variant="secondary">
                      {docType.name}
                    </Badge>
                  ))}
                  {config.documentTypes.length > 5 && (
                    <Badge variant="outline">+{config.documentTypes.length - 5} more</Badge>
                  )}
                </>
              ) : (
                <span className="text-sm text-gray-500">No document types configured</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FolderRequiredDocumentsList;
