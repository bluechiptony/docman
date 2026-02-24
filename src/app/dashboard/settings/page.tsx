"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HelpCircle, Loader } from "lucide-react";
import GeneralSettings from "@/components/settings/GeneralSettings";
import StorageSettings from "@/components/settings/StorageSettings";
import UserAccessSettings from "@/components/settings/UserAccessSettings";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import DocumentTypesSettings from "@/components/settings/DocumentTypesSettings";
import OrganizationsSettings from "@/components/settings/OrganizationsSettings";
import FolderSettingsPage from "./folder/page";
import { useAdminAccess } from "@/hooks/useAdminAccess";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const { hasAccess, loading: checkingAccess } = useAdminAccess();

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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/help/admin/settings" className="inline-flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Help
          </Link>
        </Button>
      </div>
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex flex-wrap gap-2 mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="storage">Storage</TabsTrigger>
              <TabsTrigger value="organizations">Organizations</TabsTrigger>
              {/* <TabsTrigger value="users">User & Access</TabsTrigger> */}

              {/* <TabsTrigger value="appearance">Appearance</TabsTrigger> */}
              <TabsTrigger value="folder">Folder</TabsTrigger>
              <TabsTrigger value="document-types">Document Types</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <GeneralSettings />
            </TabsContent>

            <TabsContent value="storage">
              <StorageSettings />
            </TabsContent>

            <TabsContent value="organizations">
              <OrganizationsSettings />
            </TabsContent>

            <TabsContent value="users">
              <UserAccessSettings />
            </TabsContent>

            <TabsContent value="appearance">
              <AppearanceSettings />
            </TabsContent>
            <TabsContent value="folder">
              <FolderSettingsPage />
            </TabsContent>
            <TabsContent value="document-types">
              <DocumentTypesSettings />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
