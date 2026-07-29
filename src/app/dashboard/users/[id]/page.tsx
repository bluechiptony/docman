"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { apiClient } from "@/api/client";
import UserProfile from "@/components/users/UserProfile";
import UserDocumentsList from "@/components/users/UserDocumentsList";
import { ManagerClientsSection } from "@/components/users/ManagerClientsSection";
import {
  UserRoleSection,
} from "@/components/users/UserRoleSection";
import type { AssignableUserRole } from "@/components/users/UserRoleSection";
import { useAuthUser } from "@/providers/auth.provider";

type UserRole =
  | AssignableUserRole
  | "SUPER_ADMIN"
  | "STAFF"
  | "SUPPORT"
  | "CUSTOMER"
  | "GUEST";

function isAssignableUserRole(role?: UserRole): role is AssignableUserRole {
  return role === "USER" || role === "MANAGER" || role === "ADMINISTRATOR";
}

interface UserDetails {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  authentication?: {
    role: UserRole;
    active: boolean;
  } | null;
  organizations?: Array<{
    id?: string;
    organizationId?: string;
    name?: string;
  }>;
}

interface UserDocument {
  id: string;
  name: string;
  mimeType?: string;
  createdAt?: string;
}

export default function UserPage() {
  const params = useParams<{ id: string }>();
  const { user: authenticatedUser } = useAuthUser();
  const userId = params.id;
  const [user, setUser] = useState<UserDetails | null>(null);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const loadUser = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const [userResponse, documentsResponse] = await Promise.all([
          apiClient.get<UserDetails>(`/user/${userId}`),
          apiClient.get<UserDocument[]>(`/documents/user/${userId}`),
        ]);

        if (cancelled) return;

        setUser(userResponse.data);
        setDocuments(documentsResponse.data || []);
      } catch (error) {
        if (cancelled) return;

        const responseMessage = (
          error as {
            response?: { data?: { message?: string } };
          }
        ).response?.data?.message;

        setErrorMessage(responseMessage || "Unable to load this user. Please try again.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-muted-foreground">Loading user profile...</p>
      </div>
    );
  }

  if (errorMessage || !user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <AlertCircle className="h-9 w-9 text-red-500" />
        <div>
          <p className="font-medium text-gray-900">User profile unavailable</p>
          <p className="mt-1 text-sm text-muted-foreground">{errorMessage || "User not found."}</p>
        </div>
      </div>
    );
  }

  const isManager = user.authentication?.role === "MANAGER";
  const canManageUsers =
    authenticatedUser?.authentication?.role === "ADMINISTRATOR" ||
    authenticatedUser?.authentication?.role === "SUPER_ADMIN";
  const selectedUserRole = user.authentication?.role;
  const hasAssignableRole = isAssignableUserRole(selectedUserRole);
  const userOrganization = user.organizations?.[0];
  const organizationId = userOrganization?.organizationId ?? userOrganization?.id;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">User profile</h1>
        <p className="text-sm text-muted-foreground">Profile information and uploaded documents</p>
      </div>

      <div className="space-y-6">
        <UserProfile user={user} />

        {hasAssignableRole ? (
          <UserRoleSection
            userId={user.id}
            currentRole={selectedUserRole}
            canManage={canManageUsers}
            onRoleUpdated={(role) =>
              setUser((currentUser) =>
                currentUser
                  ? {
                      ...currentUser,
                      authentication: currentUser.authentication
                        ? { ...currentUser.authentication, role }
                        : { role, active: true },
                    }
                  : currentUser,
              )
            }
          />
        ) : user.authentication?.role ? (
          <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
            The <strong>{user.authentication.role}</strong> role cannot be changed from this page.
          </div>
        ) : null}

        {isManager && organizationId && canManageUsers ? (
          <ManagerClientsSection
            userId={user.id}
            organizationId={organizationId}
            userName={`${user.firstName} ${user.lastName}`}
          />
        ) : null}

        <div>
          <h3 className="text-lg font-medium">Documents</h3>
          <UserDocumentsList documents={documents} />
        </div>
      </div>
    </div>
  );
}
