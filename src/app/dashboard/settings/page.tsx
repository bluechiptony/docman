"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GeneralSettings from "@/components/settings/GeneralSettings";
import StorageSettings from "@/components/settings/StorageSettings";
import UserAccessSettings from "@/components/settings/UserAccessSettings";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import DocumentTypesSettings from "@/components/settings/DocumentTypesSettings";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex flex-wrap gap-2 mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="storage">Storage</TabsTrigger>
              <TabsTrigger value="users">User & Access</TabsTrigger>
              <TabsTrigger value="document-types">Document Types</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <GeneralSettings />
            </TabsContent>

            <TabsContent value="storage">
              <StorageSettings />
            </TabsContent>

            <TabsContent value="users">
              <UserAccessSettings />
            </TabsContent>

            <TabsContent value="document-types">
              <DocumentTypesSettings />
            </TabsContent>

            <TabsContent value="appearance">
              <AppearanceSettings />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
