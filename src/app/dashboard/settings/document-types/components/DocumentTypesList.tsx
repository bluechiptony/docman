"use client";
import React, { useEffect, useState } from "react";
import { documentTypesApi, DocumentType } from "@/api/document-types";
import { useAuth } from "@/providers/auth.provider";

interface Props {
  reloadKey?: number;
}

const DocumentTypesList: React.FC<Props> = ({ reloadKey = 0 }) => {
  const { user } = useAuth();
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchDocumentTypes() {
      if (!user?.organizations?.[0]?.id) {
        if (!cancelled) {
          setError("No organization found");
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const organizationId = user.organizations[0].id;
        const data = await documentTypesApi.getByOrganization(organizationId);
        if (!cancelled) setDocumentTypes(data);
      } catch (e) {
        if (!cancelled) setError("Failed to load document types");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchDocumentTypes();
    return () => {
      cancelled = true;
    };
  }, [reloadKey, user]);

  if (loading) return <div>Loading document types...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-2">
      {documentTypes.length === 0 && (
        <div className="text-gray-500">No document types found. Create one to get started.</div>
      )}
      {documentTypes.map((docType) => (
        <div key={docType.id} className="border rounded px-4 py-3">
          <div className="font-medium">{docType.name}</div>
          {docType.description && <div className="text-sm text-gray-600 mt-1">{docType.description}</div>}
        </div>
      ))}
    </div>
  );
};

export default DocumentTypesList;
