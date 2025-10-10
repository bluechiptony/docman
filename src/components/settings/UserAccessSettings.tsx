"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserAccessSettings() {
  const [settings, setSettings] = useLocalStorage("settings.userAccess", {
    allowUserRegistration: true,
    requireEmailVerification: true,
    defaultRole: "viewer",
    enable2FA: false,
  });

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>User Access Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 py-4">
        {/* User Registration */}
        <div className="flex justify-between items-center">
          <div>
            <Label className="font-medium">Allow User Registration</Label>
            <p className="text-sm text-gray-500">Enable users to self-register on the platform.</p>
          </div>
          <Switch
            checked={settings.allowUserRegistration}
            onCheckedChange={(checked) => handleChange("allowUserRegistration", checked)}
          />
        </div>

        {/* Email Verification */}
        <div className="flex justify-between items-center">
          <div>
            <Label className="font-medium">Require Email Verification</Label>
            <p className="text-sm text-gray-500">
              Ensure that new users verify their email before accessing the system.
            </p>
          </div>
          <Switch
            checked={settings.requireEmailVerification}
            onCheckedChange={(checked) => handleChange("requireEmailVerification", checked)}
          />
        </div>

        {/* Default Role */}
        <div className="flex justify-between items-center">
          <div>
            <Label className="font-medium">Default User Role</Label>
            <p className="text-sm text-gray-500">Set the role automatically assigned to new users.</p>
          </div>
          <Select value={settings.defaultRole} onValueChange={(value) => handleChange("defaultRole", value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Two-Factor Authentication */}
        <div className="flex justify-between items-center">
          <div>
            <Label className="font-medium">Enable 2FA</Label>
            <p className="text-sm text-gray-500">Require users to use two-factor authentication for login.</p>
          </div>
          <Switch checked={settings.enable2FA} onCheckedChange={(checked) => handleChange("enable2FA", checked)} />
        </div>
      </CardContent>
    </Card>
  );
}
