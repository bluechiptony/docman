"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartTooltip } from "recharts";
import { Cloud, HardDrive } from "lucide-react";
import { useAuth } from "@/providers/auth.provider";
import { organizationsApi } from "@/api/organizations";
import { bytesToMegabytes, megabytesToBytes, normalizeExtensions } from "@/lib/upload-policy";
import { Input } from "@/components/ui/input";

const COLORS = ["#fbbf24", "#4ade80", "#60a5fa"];

export default function StorageSettings() {
  const { user } = useAuth();
  const [usage, setUsage] = useState([
    { name: "Documents", value: 65 },
    { name: "Media Files", value: 25 },
    { name: "Other", value: 10 },
  ]);
  const [maxUploadSizeMb, setMaxUploadSizeMb] = useState<string>("5");
  const [allowedExtensionsInput, setAllowedExtensionsInput] = useState<string>(
    ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg",
  );
  const [loadingPolicy, setLoadingPolicy] = useState(false);
  const [savingPolicy, setSavingPolicy] = useState(false);

  const [connectedDrives, setConnectedDrives] = useState({
    local: true,
    googleDrive: false,
    dropbox: false,
  });

  const totalUsed = usage.reduce((a, b) => a + b.value, 0);
  const selectedOrganizationId = user?.selectedOrganization?.id ?? user?.organizations?.[0]?.id;
  const isAdmin = user?.authentication?.role === "ADMINISTRATOR" || user?.authentication?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (!selectedOrganizationId || !isAdmin) {
      return;
    }

    let cancelled = false;
    setLoadingPolicy(true);

    organizationsApi
      .getOrganizationById(selectedOrganizationId)
      .then((organization) => {
        if (cancelled) {
          return;
        }

        setMaxUploadSizeMb(String(bytesToMegabytes(organization.maxUploadSizeBytes)));
        setAllowedExtensionsInput((organization.allowedUploadExtensions || []).join(", "));
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Failed to load upload policy settings");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingPolicy(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin, selectedOrganizationId]);

  const handleCleanup = (type: string) => {
    toast.success(`${type} cleaned successfully!`);
  };

  const handleSavePolicy = async () => {
    if (!selectedOrganizationId || !isAdmin) {
      toast.error("Only administrators can update upload policy");
      return;
    }

    const parsedMb = Number(maxUploadSizeMb);
    if (!Number.isFinite(parsedMb) || parsedMb <= 0) {
      toast.error("Max upload size must be a positive number");
      return;
    }

    const normalizedExtensions = normalizeExtensions(
      allowedExtensionsInput
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value.length > 0),
    );

    if (!normalizedExtensions.length) {
      toast.error("Provide at least one valid file extension");
      return;
    }

    setSavingPolicy(true);
    try {
      await organizationsApi.updateOrganization(selectedOrganizationId, {
        maxUploadSizeBytes: megabytesToBytes(parsedMb),
        allowedUploadExtensions: normalizedExtensions,
      });

      setAllowedExtensionsInput(normalizedExtensions.join(", "));
      toast.success("Upload policy saved successfully");
    } catch (error) {
      toast.error("Failed to save upload policy");
    } finally {
      setSavingPolicy(false);
    }
  };

  const toggleDrive = (key: keyof typeof connectedDrives) => {
    setConnectedDrives((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.info(`${key} ${connectedDrives[key] ? "disconnected" : "connected"}`);
  };

  return (
    <Card className="max-w-3xl mx-auto mt-8 border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Storage Settings</CardTitle>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Storage Usage */}
        {/* <section>
          <h3 className="text-sm font-medium mb-4 text-gray-600">Storage Usage Overview</h3>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="w-full md:w-1/2 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={usage} innerRadius={60} outerRadius={80} paddingAngle={3} dataKey="value">
                    {usage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3 w-full md:w-1/2">
              {usage.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
              <div className="mt-3">
                <Progress value={totalUsed} className="h-2" />
                <p className="text-xs text-gray-500 mt-2">{totalUsed}% of total storage used</p>
              </div>
            </div>
          </div>
        </section> */}

        {isAdmin && (
          <section>
            <h3 className="text-sm font-medium mb-4 text-gray-600">Upload Policy</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max-upload-size">Max upload size (MB)</Label>
                <Input
                  id="max-upload-size"
                  type="number"
                  min="1"
                  value={maxUploadSizeMb}
                  onChange={(event) => setMaxUploadSizeMb(event.target.value)}
                  disabled={loadingPolicy || savingPolicy}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowed-extensions">Allowed file extensions (comma separated)</Label>
                <Input
                  id="allowed-extensions"
                  value={allowedExtensionsInput}
                  onChange={(event) => setAllowedExtensionsInput(event.target.value)}
                  placeholder=".pdf, .docx, .png"
                  disabled={loadingPolicy || savingPolicy}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSavePolicy} disabled={loadingPolicy || savingPolicy}>
                  {savingPolicy ? "Saving policy..." : "Save Upload Policy"}
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Connected Drives */}
        {/* <section>
          <h3 className="text-sm font-medium mb-4 text-gray-600">Connected Drives</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HardDrive className="text-amber-500" />
                <Label htmlFor="local">Local Storage</Label>
              </div>
              <Switch id="local" checked={connectedDrives.local} onCheckedChange={() => toggleDrive("local")} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cloud className="text-blue-500" />
                <Label htmlFor="googleDrive">Google Drive</Label>
              </div>
              <Switch
                id="googleDrive"
                checked={connectedDrives.googleDrive}
                onCheckedChange={() => toggleDrive("googleDrive")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cloud className="text-sky-600" />
                <Label htmlFor="dropbox">Dropbox</Label>
              </div>
              <Switch id="dropbox" checked={connectedDrives.dropbox} onCheckedChange={() => toggleDrive("dropbox")} />
            </div>
          </div>
        </section> */}

        {/* Cleanup Tools */}
        {/* <section>
          <h3 className="text-sm font-medium mb-4 text-gray-600">Storage Maintenance</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => handleCleanup("Cache")}>
              Clear Cache
            </Button>
            <Button variant="outline" onClick={() => handleCleanup("Temporary Files")}>
              Delete Temp Files
            </Button>
            <Button variant="outline" onClick={() => handleCleanup("Recycle Bin")}>
              Empty Recycle Bin
            </Button>
          </div>
        </section> */}
      </CardContent>

      {/* <CardFooter className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => toast.info("Changes discarded")}>
          Cancel
        </Button>
        <Button onClick={() => toast.success("Storage settings saved successfully!")}>Save Changes</Button>
      </CardFooter> */}
    </Card>
  );
}
