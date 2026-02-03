import UserProfile from "@/components/users/UserProfile";
import UserDocumentsList from "@/components/users/UserDocumentsList";

interface PageProps {
  params: { id: string };
}

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

export default async function UserPage({ params }: PageProps) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  const user = await fetchJson(`${apiBase}/user/${params.id}`);
  const documents = (await fetchJson(`${apiBase}/documents/user/${params.id}`)) || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">User profile</h1>
        <p className="text-sm text-muted-foreground">Profile information and uploaded documents</p>
      </div>

      <div className="space-y-6">
        <UserProfile user={user} />

        <div>
          <h3 className="text-lg font-medium">Documents</h3>
          <UserDocumentsList documents={documents} />
        </div>
      </div>
    </div>
  );
}
