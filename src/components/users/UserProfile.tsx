import React from "react";

interface UserProfileProps {
  user: any;
}

export default function UserProfile({ user }: UserProfileProps) {
  if (!user) return <div className="text-muted-foreground">User not found</div>;

  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return (
    <div className="flex items-center gap-4 p-4 bg-white border rounded-md">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-800 font-semibold">
        {name ? name.split("").slice(0, 2).join("") : "U"}
      </div>
      <div>
        <h2 className="text-lg font-semibold">{name || user.emailAddress}</h2>
        <p className="text-sm text-muted-foreground">{user.emailAddress}</p>
        {user.organizations && user.organizations.length > 0 && (
          <p className="text-sm text-muted-foreground">Organization: {user.organizations[0].name}</p>
        )}
      </div>
    </div>
  );
}
