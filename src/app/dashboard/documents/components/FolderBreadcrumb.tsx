"use client";

export function FolderBreadcrumb({
  path,
  onNavigate,
}: {
  path: { id: string | null; name: string }[];
  onNavigate: (id: string | null) => void;
}) {
  return (
    <div className="text-sm text-muted-foreground">
      {path.map((p, i) => (
        <span key={p.id ?? "root"} className="cursor-pointer" onClick={() => onNavigate(p.id)}>
          <span className="hover:underline">{p.name}</span>
          {i < path.length - 1 && <span className="mx-1 text-gray-400">/</span>}
        </span>
      ))}
    </div>
  );
}
