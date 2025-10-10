"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function GeneralSettings() {
  const [settings, setSettings] = useState({
    fullName: "John Doe",
    language: "en",
    timezone: "Africa/Lagos",
    darkMode: false,
    autoSave: true,
  });

  const handleSave = () => {
    toast.success("General settings saved successfully!");
    console.log("Saved General Settings:", settings);
  };

  const handleCancel = () => {
    toast.info("Changes discarded");
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8 border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">General Settings</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={settings.fullName}
            onChange={(e) => setSettings((prev) => ({ ...prev, fullName: e.target.value }))}
            placeholder="Enter your full name"
          />
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <Label>Language</Label>
          <Select
            value={settings.language}
            onValueChange={(value) => setSettings((prev) => ({ ...prev, language: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="de">German</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Timezone Selection */}
        <div className="space-y-2">
          <Label>Timezone</Label>
          <Select
            value={settings.timezone}
            onValueChange={(value) => setSettings((prev) => ({ ...prev, timezone: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Africa/Lagos">Africa/Lagos (GMT+1)</SelectItem>
              <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
              <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
              <SelectItem value="Asia/Dubai">Asia/Dubai (GMT+4)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dark Mode */}
        <div className="flex items-center justify-between">
          <Label htmlFor="darkMode">Dark Mode</Label>
          <Switch
            id="darkMode"
            checked={settings.darkMode}
            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, darkMode: checked }))}
          />
        </div>

        {/* Auto Save */}
        <div className="flex items-center justify-between">
          <Label htmlFor="autoSave">Auto Save Changes</Label>
          <Switch
            id="autoSave"
            checked={settings.autoSave}
            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, autoSave: checked }))}
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-3">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}
