"use client";
import { Suspense } from "react";
import DocumentsPage from "./components/doc-page";
export default function DocumentsPageComponent() {
  return (
    <Suspense>
      <DocumentsPage />
    </Suspense>
  );
}
