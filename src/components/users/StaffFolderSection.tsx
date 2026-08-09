"use client";

import { useEffect, useState } from "react";
import { Folder, Loader2, Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface StaffFolderProfile {
  folder: {
    id: string;
    name: string;
    organizationId: string;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
    clients: Array<{ id: string; name: string }>;
  };
  staff: {
    id: string;
    firstName: string;
    otherName: string | null;
    lastName: string;
    emailAddress: string;
    staffId: string | null;
  };
}

interface StaffFolderSectionProps {
  userId: string;
  organizationId: string;
  profile: StaffFolderProfile;
  canEdit: boolean;
  onUpdated: (profile: StaffFolderProfile) => void;
}

function errorMessage(error: unknown): string {
  return (
    (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
    "Unable to update the staff folder information."
  );
}

export function StaffFolderSection({
  userId,
  organizationId,
  profile,
  canEdit,
  onUpdated,
}: StaffFolderSectionProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: profile.staff.firstName,
    otherName: profile.staff.otherName ?? "",
    lastName: profile.staff.lastName,
    staffId: profile.staff.staffId ?? "",
  });

  useEffect(() => {
    setForm({
      firstName: profile.staff.firstName,
      otherName: profile.staff.otherName ?? "",
      lastName: profile.staff.lastName,
      staffId: profile.staff.staffId ?? "",
    });
  }, [profile]);

  const cancelEditing = () => {
    setForm({
      firstName: profile.staff.firstName,
      otherName: profile.staff.otherName ?? "",
      lastName: profile.staff.lastName,
      staffId: profile.staff.staffId ?? "",
    });
    setEditing(false);
  };

  const saveProfile = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    setSaving(true);
    try {
      const response = await apiClient.patch<StaffFolderProfile>(
        `/user/${userId}/staff-folder`,
        {
          firstName: form.firstName.trim(),
          otherName: form.otherName.trim(),
          lastName: form.lastName.trim(),
          staffId: form.staffId.trim(),
        },
        { params: { organizationId } },
      );
      onUpdated(response.data);
      setEditing(false);
      toast.success("Staff folder information updated");
    } catch (error: unknown) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-blue-600" />
            Staff folder information
          </CardTitle>
          <CardDescription className="mt-1">
            Folder: {profile.folder.name}
            {profile.folder.clients.length > 0
              ? ` · Client: ${profile.folder.clients.map((client) => client.name).join(", ")}`
              : ""}
          </CardDescription>
        </div>

        {canEdit && !editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        ) : null}
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="staff-first-name">First name</Label>
            <Input
              id="staff-first-name"
              value={form.firstName}
              disabled={!editing || saving}
              maxLength={100}
              onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="staff-middle-name">Middle name</Label>
            <Input
              id="staff-middle-name"
              value={form.otherName}
              disabled={!editing || saving}
              maxLength={100}
              placeholder="Not provided"
              onChange={(event) => setForm((current) => ({ ...current, otherName: event.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="staff-last-name">Last name</Label>
            <Input
              id="staff-last-name"
              value={form.lastName}
              disabled={!editing || saving}
              maxLength={100}
              onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="staff-identifier">Staff ID</Label>
            <Input
              id="staff-identifier"
              value={form.staffId}
              disabled={!editing || saving}
              maxLength={100}
              placeholder="Not provided"
              onChange={(event) => setForm((current) => ({ ...current, staffId: event.target.value }))}
            />
          </div>
        </div>

        {editing ? (
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={cancelEditing} disabled={saving}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={saveProfile} disabled={saving || !form.firstName.trim() || !form.lastName.trim()}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save changes
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
