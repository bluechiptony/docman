"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function StorageSettings() {
  const [settings, setSettings] = useState({
    storageLimit: "10GB",
    enableFileVersioning: true,
    enableEncryption: true,
    backupProvider: "Google Drive",
    backupPath: "/backups/docman/",
  });

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    alert("Storage settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Storage Settings</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Storage Limit */}
          <div className="flex items-center justify-between">
            <Label htmlFor="storageLimit" className="w-1/3">
              Storage Limit
            </Label>
            <Input
              id="storageLimit"
              value={settings.storageLimit}
              onChange={(e) => handleChange("storageLimit", e.target.value)}
              className="w-2/3"
            />
          </div>

          {/* File Versioning */}
          <div className="flex items-center justify-between">
            <Label htmlFor="fileVersioning" className="w-1/3">
              Enable File Versioning
            </Label>
            <Switch
              id="fileVersioning"
              checked={settings.enableFileVersioning}
              onCheckedChange={(checked) => handleChange("enableFileVersioning", checked)}
            />
          </div>

          {/* Encryption */}
          <div className="flex items-center justify-between">
            <Label htmlFor="encryption" className="w-1/3">
              Enable Encryption
            </Label>
            <Switch
              id="encryption"
              checked={settings.enableEncryption}
              onCheckedChange={(checked) => handleChange("enableEncryption", checked)}
            />
          </div>

          {/* Backup Provider */}
          <div className="flex items-center justify-between">
            <Label htmlFor="backupProvider" className="w-1/3">
              Backup Provider
            </Label>
            <Select value={settings.backupProvider} onValueChange={(value) => handleChange("backupProvider", value)}>
              <SelectTrigger className="w-2/3">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Google Drive">Google Drive</SelectItem>
                <SelectItem value="Dropbox">Dropbox</SelectItem>
                <SelectItem value="AWS S3">AWS S3</SelectItem>
                <SelectItem value="Azure Blob Storage">Azure Blob Storage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Backup Path */}
          <div className="flex items-center justify-between">
            <Label htmlFor="backupPath" className="w-1/3">
              Backup Path
            </Label>
            <Input
              id="backupPath"
              value={settings.backupPath}
              onChange={(e) => handleChange("backupPath", e.target.value)}
              className="w-2/3"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
