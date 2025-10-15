"use client";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoleBadge } from "../../users/components/RoleBadge";

interface DocumentDrawerProps {
  open: boolean;
  onClose: () => void;
  documentId: string | null;
}

export default function DocumentDrawer({ open, onClose, documentId }: DocumentDrawerProps) {
  const [doc, setDoc] = useState<any>({
    id: documentId,
    name: "HR_Policies_2025.pdf",
    size: 1048,
    type: "PDF Document",
    uploadedBy: "Jane Doe",
    createdAt: "2025-10-05T10:30:00Z",
    updatedAt: "2025-10-12T14:15:00Z",
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [showShareModal, setShowShareModal] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("Viewer");

  // Dummy list of platform users
  const platformUsers = [
    { id: "1", name: "Jane Doe", role: "Admin" },
    { id: "2", name: "Samuel Obeng", role: "Viewer" },
    { id: "3", name: "Ada Nwosu", role: "Editor" },
    { id: "4", name: "Chidi Okafor", role: "Admin" },
    { id: "5", name: "Mary Johnson", role: "Editor" },
  ];

  const handleAddUser = () => {
    if (!selectedUser) {
      toast.error("Select a user to share with");
      return;
    }

    const user = platformUsers.find((u) => u.id === selectedUser);
    if (!user) return;

    // Prevent duplicate additions
    if (permissions.some((p) => p.user === user.name)) {
      toast.info(`${user.name} already has access.`);
      return;
    }

    setPermissions((prev) => [...prev, { user: user.name, role: selectedRole }]);
    toast.success(`${user.name} added as ${selectedRole}`);
    setShowShareModal(false);
  };

  const handleRoleChange = (userName: string, newRole: string) => {
    setPermissions((prev) => prev.map((p) => (p.user === userName ? { ...p, role: newRole } : p)));
    toast.success(`${userName}'s role updated to ${newRole}`);
  };

  useEffect(() => {
    if (!documentId) return;
    setDoc({
      id: documentId,
      name: "HR_Policies_2025.pdf",
      size: 1048,
      type: "PDF Document",
      uploadedBy: "Jane Doe",
      createdAt: "2025-10-05T10:30:00Z",
      updatedAt: "2025-10-12T14:15:00Z",
    });

    // Fetch document details (replace with your API call)
    // fetch(`/api/documents/${documentId}`)
    //   .then((res) => res.json())
    //   .then((data) => setDoc(data));

    // fetch(`/api/documents/${documentId}/activity`)
    //   .then((res) => res.json())
    //   .then((data) => setActivities(data));

    // fetch(`/api/documents/${documentId}/permissions`)
    //   .then((res) => res.json())
    //   .then((data) => setPermissions(data));

    // setDoc({ id: "3", name: "Report.pdf", type: "file", parentId: null });

    // simulate loading document data
    setTimeout(() => {
      setLoading(true);

      setActivities([
        {
          user: "Jane Doe",
          action: "uploaded this file",
          timestamp: "2025-10-05T10:31:00Z",
        },
        {
          user: "Samuel Obeng",
          action: "viewed document",
          timestamp: "2025-10-06T09:00:00Z",
        },
        {
          user: "Ada Nwosu",
          action: "shared document with team",
          timestamp: "2025-10-07T11:25:00Z",
        },
        {
          user: "Jane Doe",
          action: "updated document title",
          timestamp: "2025-10-08T15:40:00Z",
        },
      ]);

      setPermissions([
        { user: "Jane Doe", role: "Owner" },
        { user: "Samuel Obeng", role: "Editor" },
        { user: "Ada Nwosu", role: "Viewer" },
      ]);

      setLoading(false);
    }, 300);
  }, [documentId]);

  const updateUserRole = (id: string, newRole: string) => {
    setPermissions((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
  };

  //   if (!doc) return null;

  return (
    <>
      <Drawer open={open} onClose={onClose}>
        <DrawerContent className="p-4 md:max-w-md ml-auto">
          <DrawerHeader>
            <DrawerTitle className="text-lg font-semibold">{doc.name}</DrawerTitle>
            <DrawerDescription>Document details and permissions</DrawerDescription>
          </DrawerHeader>

          <Tabs defaultValue="details" className="mt-4">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            {/* DETAILS TAB */}
            <TabsContent value="details" className="mt-4">
              <ScrollArea className="h-80">
                <div className="space-y-3 text-sm">
                  <p>
                    <strong>File Name:</strong> {doc.name}
                  </p>
                  <p>
                    <strong>Size:</strong> {doc.size} KB
                  </p>
                  <p>
                    <strong>Type:</strong> {doc.type}
                  </p>
                  <p>
                    <strong>Uploaded By:</strong> {doc.uploadedBy}
                  </p>
                  <p>
                    <strong>Created:</strong> {new Date(doc.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Last Modified:</strong> {new Date(doc.updatedAt).toLocaleString()}
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* ACTIVITY TAB */}
            <TabsContent value="activity" className="mt-4">
              <ScrollArea className="h-80">
                <ul className="space-y-2">
                  {activities.map((a, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm border-b pb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{a.user.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{a.user}</span>
                      <span>{a.action}</span>
                      <span className="text-xs text-gray-400 ml-auto">{new Date(a.timestamp).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </TabsContent>

            {/* PERMISSIONS */}
            <TabsContent value="permissions" className="mt-4">
              <div className="flex justify-end mb-3">
                <Button size="sm" variant="outline" onClick={() => setShowShareModal(true)}>
                  + Add User
                </Button>
              </div>
              <ScrollArea className="h-80">
                <ul className="space-y-2">
                  {permissions.map((p, i) => (
                    <li key={i} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{p.user.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{p.user}</span>
                      </div>

                      {/* Editable Role */}
                      <Select value={p.role} onValueChange={(value) => handleRoleChange(p.user, value)}>
                        <SelectTrigger className="w-[110px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Viewer">Viewer</SelectItem>
                          <SelectItem value="Editor">Editor</SelectItem>
                          <SelectItem value="Owner">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DrawerContent>
      </Drawer>
      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Share Document</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />

            <ScrollArea className="max-h-40 border rounded-md">
              <ul>
                {platformUsers
                  .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
                  .map((user) => (
                    <li
                      key={user.id}
                      className={`p-2 cursor-pointer ${selectedUser === user.id ? "bg-blue-100" : "hover:bg-gray-100"}`}
                      onClick={() => setSelectedUser(user.id)}
                    >
                      {user.name}
                      <RoleBadge role={user.role} onChange={(r) => updateUserRole(user.id, r)} />
                    </li>
                  ))}
              </ul>
            </ScrollArea>

            <div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                  <SelectItem value="Editor">Editor</SelectItem>
                  <SelectItem value="Owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowShareModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
