"use client";
import React, { useState } from "react";
import { documentTypesApi } from "@/api/document-types";
import { useAuth } from "@/providers/auth.provider";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateDocumentTypeModal: React.FC<Props> = ({ isOpen, onClose, onCreated }) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setDescription("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id || !user?.organizations?.[0]?.id) {
      setError("User or organization not found");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await documentTypesApi.create({
        name,
        description: description || undefined,
        organizationId: user.organizations[0].id,
        createdById: user.id,
      });
      toast.success("Document type created successfully");
      onCreated();
      reset();
      onClose();
    } catch (e: any) {
      const errorMsg = e.response?.data?.message || "Failed to create document type";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Create Document Type</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Name *</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Contract, Invoice, Resume"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
            />
          </div>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded"
              onClick={() => {
                reset();
                onClose();
              }}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDocumentTypeModal;
