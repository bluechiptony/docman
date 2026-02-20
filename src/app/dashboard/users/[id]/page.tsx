import UserProfile from "@/components/users/UserProfile";
import UserDocumentsList from "@/components/users/UserDocumentsList";
import { ManagerClientsSection } from "@/components/users/ManagerClientsSection";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

export default async function UserPage({ params }: PageProps) {
  const { id } = await params;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  const user = await fetchJson(`${apiBase}/user/${id}`);
  const documents = (await fetchJson(`${apiBase}/documents/user/${id}`)) || [];

  // Check if user is a MANAGER
  const isManager = user?.authentication?.role === "MANAGER";
  const userOrganization = user?.organizations?.[0];

  console.log("User profile debug:", {
    userId: user?.id,
    role: user?.authentication?.role,
    isManager,
    hasOrganization: !!userOrganization,
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">User profile</h1>
        <p className="text-sm text-muted-foreground">Profile information and uploaded documents</p>
      </div>

      <div className="space-y-6">
        <UserProfile user={user} />

        {isManager && userOrganization ? (
          <ManagerClientsSection
            userId={user.id}
            organizationId={userOrganization.id}
            userName={`${user.firstName} ${user.lastName}`}
          />
        ) : user?.authentication?.role ? (
          <div className="p-4 border rounded-lg bg-muted/50 text-sm text-muted-foreground">
            Client assignment is only available for users with the MANAGER role. Current role:{" "}
            <strong>{user.authentication.role}</strong>
          </div>
        ) : null}

        <div>
          <h3 className="text-lg font-medium">Documents</h3>
          <UserDocumentsList documents={documents} />
        </div>
      </div>
    </div>
  );
}
