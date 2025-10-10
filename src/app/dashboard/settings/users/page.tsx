"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash } from "lucide-react";

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export default function UserSettings() {
  const [roles, setRoles] = useState<Role[]>([
    { id: "1", name: "Admin", permissions: ["view", "edit", "delete"] },
    { id: "2", name: "Editor", permissions: ["view", "edit"] },
    { id: "3", name: "Viewer", permissions: ["view"] },
  ]);

  const [newRole, setNewRole] = useState("");
  const [allowSignup, setAllowSignup] = useState(true);
  const [require2FA, setRequire2FA] = useState(false);
  const [defaultRole, setDefaultRole] = useState("Viewer");

  const handleAddRole = () => {
    if (!newRole.trim()) return;
    setRoles([...roles, { id: Date.now().toString(), name: newRole, permissions: [] }]);
    setNewRole("");
  };

  const handleDeleteRole = (id: string) => {
    setRoles(roles.filter((r) => r.id !== id));
  };

  const handleSave = () => {
    console.log("User settings saved:", { allowSignup, require2FA, defaultRole, roles });
    alert("User and access settings saved!");
  };

  return (
    <div className="space-y-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>User & Access Settings</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Signup Policy */}
          <div className="flex items-center justify-between">
            <Label htmlFor="allowSignup" className="w-1/3">
              Allow New User Signups
            </Label>
            <Switch id="allowSignup" checked={allowSignup} onCheckedChange={(checked) => setAllowSignup(checked)} />
          </div>

          {/* Two-Factor Auth */}
          <div className="flex items-center justify-between">
            <Label htmlFor="require2FA" className="w-1/3">
              Require 2-Factor Authentication
            </Label>
            <Switch id="require2FA" checked={require2FA} onCheckedChange={(checked) => setRequire2FA(checked)} />
          </div>

          {/* Default Role */}
          <div className="flex items-center justify-between">
            <Label htmlFor="defaultRole" className="w-1/3">
              Default User Role
            </Label>
            <Select value={defaultRole} onValueChange={setDefaultRole}>
              <SelectTrigger className="w-2/3">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role Management */}
          <div className="pt-4">
            <h3 className="text-sm font-semibold mb-2 text-gray-600">Manage Roles</h3>
            <div className="space-y-3">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center justify-between border border-gray-200 rounded-md p-3">
                  <div>
                    <p className="font-medium">{role.name}</p>
                    <p className="text-xs text-gray-500">{role.permissions.join(", ") || "No permissions"}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteRole(role.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add Role */}
            <div className="flex items-center gap-2 mt-4">
              <Input placeholder="New role name" value={newRole} onChange={(e) => setNewRole(e.target.value)} />
              <Button onClick={handleAddRole}>
                <PlusCircle size={16} className="mr-1" /> Add Role
              </Button>
            </div>
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
