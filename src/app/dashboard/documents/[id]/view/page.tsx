import { Suspense } from "react";
import { DocumentViewer } from "@/components/documents/DocumentViewer";

interface PageProps {
  params: { id: string };
  searchParams?: { expires?: string };
}

export default function DocumentViewPage({ params, searchParams }: PageProps) {
  const expires = searchParams?.expires ? Number(searchParams.expires) : undefined;

  return (
    <div className="p-6">
      <Suspense fallback={<div className="h-[80vh]" />}>
        {" "}
        {/* empty fallback to avoid layout shift */}
        <DocumentViewer documentId={params.id} expiresInSeconds={expires ?? 300} />
      </Suspense>
    </div>
  );
}
