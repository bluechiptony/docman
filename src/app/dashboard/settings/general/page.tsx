"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function GeneralSettings() {
  const [settings, setSettings] = useState({
    organizationName: "Docman Inc.",
    defaultLanguage: "English",
    timezone: "GMT +1 (West Africa)",
    enableNotifications: true,
  });

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    console.log("Saved settings:", settings);
    alert("Settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Organization Name */}
          <div className="flex items-center justify-between">
            <Label htmlFor="organizationName" className="w-1/3">
              Organization Name
            </Label>
            <Input
              id="organizationName"
              value={settings.organizationName}
              onChange={(e) => handleChange("organizationName", e.target.value)}
              className="w-2/3"
            />
          </div>

          {/* Default Language */}
          <div className="flex items-center justify-between">
            <Label htmlFor="defaultLanguage" className="w-1/3">
              Default Language
            </Label>
            <Input
              id="defaultLanguage"
              value={settings.defaultLanguage}
              onChange={(e) => handleChange("defaultLanguage", e.target.value)}
              className="w-2/3"
            />
          </div>

          {/* Timezone */}
          <div className="flex items-center justify-between">
            <Label htmlFor="timezone" className="w-1/3">
              Timezone
            </Label>
            <Input
              id="timezone"
              value={settings.timezone}
              onChange={(e) => handleChange("timezone", e.target.value)}
              className="w-2/3"
            />
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications" className="w-1/3">
              Enable Notifications
            </Label>
            <Switch
              id="notifications"
              checked={settings.enableNotifications}
              onCheckedChange={(checked) => handleChange("enableNotifications", checked)}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
