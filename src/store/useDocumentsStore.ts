import { create } from "zustand";

export interface DocumentItem {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  status: "uploaded" | "uploading" | "failed";
}

interface DocumentsState {
  documents: DocumentItem[];
  addDocument: (doc: DocumentItem) => void;
  updateDocument: (id: string, data: Partial<DocumentItem>) => void;
}

export const useDocumentsStore = create<DocumentsState>((set) => ({
  documents: [],
  addDocument: (doc) =>
    set((state) => ({ documents: [doc, ...state.documents] })),
  updateDocument: (id, data) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, ...data } : d
      ),
    })),
}));
