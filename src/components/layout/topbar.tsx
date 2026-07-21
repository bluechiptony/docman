"use client";

import { FormEvent, useState } from "react";
import { Menu, LogOut, KeyRound, Building2, HelpCircle } from "lucide-react";
import { useAuthUser } from "@/providers/auth.provider";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/api/client";
import type { OrganizationOption } from "@/api/organizations";
import { toast } from "sonner";

interface TopBarProps {
  toggleMobileSidebar: () => void;
}

export default function TopBar({ toggleMobileSidebar }: TopBarProps) {
  const { user, logout, selectOrganization } = useAuthUser();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const canSelectOrganization = user?.authentication?.role === "SUPER_ADMIN";
  const initials = `${user?.firstName?.trim().charAt(0) || ""}${user?.lastName?.trim().charAt(0) || ""}`.toUpperCase() || "?";

  const handleOrgChange = (orgId: string) => {
    selectOrganization(orgId);
  };

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handlePasswordDialogChange = (open: boolean) => {
    if (changingPassword) return;
    setChangePasswordOpen(open);
    if (!open) resetPasswordForm();
  };

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Complete all password fields");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (currentPassword === newPassword) {
      toast.error("New password must be different from the current password");
      return;
    }

    setChangingPassword(true);
    try {
      const response = await apiClient.patch("/auth/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      toast.success(response.data?.message || "Password changed successfully");
      setChangePasswordOpen(false);
      resetPasswordForm();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <header className="flex items-center justify-between bg-white px-4 py-3 border-b border-gray-200 shadow-sm">
      {/* Mobile Menu Button */}
      <button onClick={toggleMobileSidebar} className="md:hidden text-gray-700 focus:outline-none">
        <Menu size={24} />
      </button>

      <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>

      <div className="flex items-center space-x-4">
        {/* Organization Selector */}
        {canSelectOrganization && user?.organizations && user.organizations.length > 1 && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-600" />
            <Select value={user.selectedOrganization?.id || ""} onValueChange={handleOrgChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {user.organizations.map((org: OrganizationOption) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Open account menu">
              <Avatar className="h-8 w-8 border border-gray-300">
                <AvatarFallback className="bg-[#0A3A5C] text-xs font-semibold text-white">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{user?.emailAddress}</p>
                {user?.selectedOrganization && (
                  <p className="text-xs text-muted-foreground">{user.selectedOrganization.name}</p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setChangePasswordOpen(true)}>
              <KeyRound className="mr-2 h-4 w-4" />
              <span>Change password</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/help" className="flex items-center cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help & Documentation</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={changePasswordOpen} onOpenChange={handlePasswordDialogChange}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(event) => changingPassword && event.preventDefault()}>
          <form onSubmit={handleChangePassword}>
            <DialogHeader>
              <DialogTitle>Change password</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-5">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current password</Label>
                <Input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  disabled={changingPassword}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  disabled={changingPassword}
                  minLength={8}
                  required
                />
                <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={changingPassword}
                  minLength={8}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handlePasswordDialogChange(false)} disabled={changingPassword}>
                Cancel
              </Button>
              <Button type="submit" disabled={changingPassword}>
                {changingPassword ? "Changing..." : "Change password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
}
