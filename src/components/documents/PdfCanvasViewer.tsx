"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from "pdfjs-dist";

interface PdfCanvasViewerProps {
  url: string;
  title?: string;
  className?: string;
}

export function PdfCanvasViewer({ url, title = "PDF preview", className = "" }: PdfCanvasViewerProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRefs = useRef<Array<HTMLCanvasElement | null>>([]);
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null);
  const renderTaskRefs = useRef<RenderTask[]>([]);
  const scrollFrameRef = useRef<number | null>(null);
  const currentPageRef = useRef(1);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [renderingPage, setRenderingPage] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    currentPageRef.current = pageNumber;
  }, [pageNumber]);

  useEffect(() => {
    let cancelled = false;

    const loadPdf = async () => {
      setLoading(true);
      setError(null);
      setPdf(null);
      setPageNumber(1);
      canvasRefs.current = [];
      pageRefs.current = [];

      try {
        const pdfjs = await import("pdfjs-dist/webpack.mjs");
        const loadingTask = pdfjs.getDocument({ url });
        loadingTaskRef.current = loadingTask;
        const loadedPdf = await loadingTask.promise;

        if (!cancelled) {
          setPdf(loadedPdf);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load this PDF.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadPdf();

    return () => {
      cancelled = true;
      renderTaskRefs.current.forEach((task) => task.cancel());
      renderTaskRefs.current = [];
      void loadingTaskRef.current?.destroy();
      loadingTaskRef.current = null;
      if (scrollFrameRef.current !== null) {
        cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, [url]);

  useEffect(() => {
    if (!pdf) return;

    let cancelled = false;
    renderTaskRefs.current.forEach((task) => task.cancel());
    renderTaskRefs.current = [];

    const renderAllPages = async () => {
      setError(null);

      try {
        for (let index = 0; index < pdf.numPages; index += 1) {
          if (cancelled) return;

          const canvas = canvasRefs.current[index];
          if (!canvas) continue;

          const currentPage = index + 1;
          setRenderingPage(currentPage);
          const page = await pdf.getPage(currentPage);
          if (cancelled) return;

          const viewport = page.getViewport({ scale: 1.35 * zoom });
          const outputScale = window.devicePixelRatio || 1;
          const context = canvas.getContext("2d");

          if (!context) {
            throw new Error("PDF canvas is unavailable.");
          }

          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = `${Math.floor(viewport.height)}px`;

          const renderTask = page.render({
            canvas,
            canvasContext: context,
            viewport,
            transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined,
          });
          renderTaskRefs.current.push(renderTask);
          await renderTask.promise;
        }

        if (!cancelled) {
          requestAnimationFrame(() => {
            const container = scrollContainerRef.current;
            const page = pageRefs.current[currentPageRef.current - 1];

            if (container && page) {
              const pageTop =
                page.getBoundingClientRect().top -
                container.getBoundingClientRect().top +
                container.scrollTop -
                16;
              container.scrollTop = pageTop;
            }
          });
        }
      } catch (renderError) {
        if (!cancelled && !(renderError instanceof Error && renderError.name === "RenderingCancelledException")) {
          setError(renderError instanceof Error ? renderError.message : "Unable to render this PDF.");
        }
      } finally {
        if (!cancelled) {
          setRenderingPage(null);
        }
      }
    };

    void renderAllPages();

    return () => {
      cancelled = true;
      renderTaskRefs.current.forEach((task) => task.cancel());
      renderTaskRefs.current = [];
    };
  }, [pdf, zoom]);

  const pageCount = pdf?.numPages ?? 0;

  const getPageScrollTop = (page: HTMLDivElement, container: HTMLDivElement) => {
    return page.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 16;
  };

  const scrollToPage = (nextPage: number) => {
    const normalizedPage = Math.min(pageCount, Math.max(1, nextPage));
    const container = scrollContainerRef.current;
    const page = pageRefs.current[normalizedPage - 1];

    setPageNumber(normalizedPage);
    if (container && page) {
      container.scrollTo({
        top: getPageScrollTop(page, container),
        behavior: "smooth",
      });
    }
  };

  const updateVisiblePage = () => {
    const container = scrollContainerRef.current;
    if (!container || pageRefs.current.length === 0) return;

    const containerRect = container.getBoundingClientRect();
    const viewportCenter = container.scrollTop + container.clientHeight / 2;
    let closestPage = 1;
    let closestDistance = Number.POSITIVE_INFINITY;

    pageRefs.current.forEach((page, index) => {
      if (!page) return;
      const pageTop = page.getBoundingClientRect().top - containerRect.top + container.scrollTop;
      const pageCenter = pageTop + page.offsetHeight / 2;
      const distance = Math.abs(pageCenter - viewportCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPage = index + 1;
      }
    });

    setPageNumber((current) => (current === closestPage ? current : closestPage));
  };

  return (
    <div className={`flex h-full min-h-0 min-w-0 bg-neutral-100 ${className}`} aria-label={title}>
      <div className="flex w-16 shrink-0 flex-col items-center gap-2 overflow-y-auto border-r bg-white px-2 py-3 sm:w-20">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => scrollToPage(pageNumber - 1)}
          disabled={loading || pageNumber <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="py-1 text-center text-xs leading-tight text-muted-foreground" aria-live="polite">
          <span className="block font-medium text-foreground">{pageNumber}</span>
          <span className="block">of {pageCount || "—"}</span>
        </span>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => scrollToPage(pageNumber + 1)}
          disabled={loading || pageNumber >= pageCount}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="my-1 h-px w-8 bg-border" />

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setZoom((value) => Math.max(0.6, Number((value - 0.2).toFixed(1))))}
          disabled={loading || zoom <= 0.6}
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        <span className="text-center text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setZoom((value) => Math.min(2.4, Number((value + 0.2).toFixed(1))))}
          disabled={loading || zoom >= 2.4}
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        {renderingPage !== null && (
          <span className="mt-1 flex flex-col items-center gap-1 text-center text-[10px] leading-tight text-muted-foreground" role="status">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>
              Rendering
              <br />
              {renderingPage}/{pageCount}
            </span>
          </span>
        )}
      </div>

      <div
        ref={scrollContainerRef}
        className="relative h-full min-h-0 min-w-0 flex-1 touch-pan-x touch-pan-y overflow-auto overscroll-contain p-4"
        data-vaul-no-drag
        tabIndex={0}
        onScroll={() => {
          if (scrollFrameRef.current !== null) {
            cancelAnimationFrame(scrollFrameRef.current);
          }
          scrollFrameRef.current = requestAnimationFrame(updateVisiblePage);
        }}
        onWheelCapture={(event) => event.stopPropagation()}
        onContextMenu={(event) => event.preventDefault()}
      >
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-100/75" role="status">
            <div className="flex items-center gap-2 rounded-md bg-white px-4 py-3 text-sm text-muted-foreground shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading PDF...</span>
            </div>
          </div>
        )}

        {error ? (
          <div className="mx-auto rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : (
          <div className="flex w-max min-w-full flex-col items-center gap-4 pb-4">
            {Array.from({ length: pageCount }, (_, index) => (
              <div
                key={index + 1}
                ref={(element) => {
                  pageRefs.current[index] = element;
                }}
                className="shrink-0 scroll-mt-4 bg-white shadow-md"
                aria-label={`${title}, page ${index + 1}`}
              >
                <canvas
                  ref={(element) => {
                    canvasRefs.current[index] = element;
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
