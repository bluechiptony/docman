/** Recognize images even when uploads have missing or generic MIME metadata. */
export function isImageDocument(mimeType?: string | null, name?: string | null): boolean {
  return (
    Boolean(mimeType?.trim().toLowerCase().startsWith("image/")) ||
    /\.(png|jpe?g)$/i.test(name?.trim() || "")
  );
}
