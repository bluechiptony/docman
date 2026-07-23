"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Menu, LogOut, KeyRound, Building2, HelpCircle, Bell, Clock3, CheckCircle2, XCircle } from "lucide-react";
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
import { conversionsApi, ConversionBatch } from "@/api/conversions";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { isStrongPassword, PASSWORD_POLICY_MESSAGE } from "@/lib/password-policy";

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
  const [conversionSummary, setConversionSummary] = useState<{
    unreadCount: number;
    activeCount: number;
    recent: ConversionBatch[];
  }>({ unreadCount: 0, activeCount: 0, recent: [] });
  const canSelectOrganization = user?.authentication?.role === "SUPER_ADMIN";
  const canConvert = ["MANAGER", "ADMINISTRATOR", "SUPER_ADMIN"].includes(user?.authentication?.role || "");
  const organizationId = user?.selectedOrganization?.id ?? user?.organizations?.[0]?.id;
  const initials = `${user?.firstName?.trim().charAt(0) || ""}${user?.lastName?.trim().charAt(0) || ""}`.toUpperCase() || "?";

  const handleOrgChange = (orgId: string) => {
    selectOrganization(orgId);
  };

  const loadConversionSummary = useCallback(async () => {
    if (!canConvert || !organizationId || document.hidden) return;
    try {
      setConversionSummary(await conversionsApi.summary(organizationId));
    } catch {
      // Notifications are non-blocking; the conversion page surfaces request errors.
    }
  }, [canConvert, organizationId]);

  useEffect(() => {
    loadConversionSummary();
    const interval = window.setInterval(loadConversionSummary, 30000);
    document.addEventListener("visibilitychange", loadConversionSummary);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", loadConversionSummary);
    };
  }, [loadConversionSummary]);

  const markConversionRead = async (batch: ConversionBatch) => {
    if (!batch.notificationReadAt) {
      await conversionsApi.markRead(batch.id).catch(() => undefined);
      setConversionSummary((current) => ({
        ...current,
        unreadCount: Math.max(0, current.unreadCount - 1),
        recent: current.recent.map((item) => item.id === batch.id ? { ...item, notificationReadAt: new Date().toISOString() } : item),
      }));
    }
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
    if (!isStrongPassword(newPassword)) {
      toast.error(PASSWORD_POLICY_MESSAGE);
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
        {canConvert && organizationId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Conversion notifications">
                <Bell className="h-5 w-5" />
                {conversionSummary.unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                    {Math.min(99, conversionSummary.unreadCount)}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Document conversions</span>
                {conversionSummary.activeCount > 0 && <span className="text-xs font-normal text-amber-600">{conversionSummary.activeCount} active</span>}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {!conversionSummary.recent.length && <div className="px-3 py-6 text-center text-sm text-muted-foreground">No completed conversions</div>}
              {conversionSummary.recent.map((batch) => {
                const success = batch.jobs.filter((job) => job.status === "COMPLETED").length;
                const failed = batch.jobs.filter((job) => job.status === "FAILED" || job.status === "EXPIRED").length;
                return (
                  <DropdownMenuItem key={batch.id} asChild onSelect={() => markConversionRead(batch)}>
                    <Link href="/dashboard/convert" className="flex cursor-pointer items-start gap-3 py-3">
                      {failed ? <XCircle className="mt-0.5 h-4 w-4 text-red-500" /> : success ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" /> : <Clock3 className="mt-0.5 h-4 w-4 text-amber-500" />}
                      <span className="flex-1"><span className="block text-sm font-medium">Conversion batch complete</span><span className="block text-xs text-muted-foreground">{success} ready · {failed} failed</span></span>
                      {!batch.notificationReadAt && <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/dashboard/convert" className="cursor-pointer justify-center font-medium">View all conversions</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                <PasswordStrength password={newPassword} />
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
