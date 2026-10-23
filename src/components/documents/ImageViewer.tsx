"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Maximize, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Zoom is relative to the image's initial fit inside the available viewport. */
export function ImageViewer({ url, title }: { url: string; title: string }) {
  return <ImageViewport key={url} url={url} title={title} />;
}

function ImageViewport({ url, title }: { url: string; title: string }) {
  const viewport = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const previousSize = useRef({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      setSize({ width: element.clientWidth, height: element.clientHeight });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const fit = natural.width && natural.height
    ? Math.min(size.width / natural.width, size.height / natural.height)
    : 0;
  const width = natural.width * fit * zoom;
  const height = natural.height * fit * zoom;
  const canvasWidth = Math.max(size.width, width);
  const canvasHeight = Math.max(size.height, height);
  const ready = fit > 0 && !failed;

  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const previous = previousSize.current;
    // Keep the point at the centre of the viewport in view as zoom changes.
    element.scrollLeft = previous.width
      ? ((element.scrollLeft + size.width / 2) / previous.width) * canvasWidth - size.width / 2
      : 0;
    element.scrollTop = previous.height
      ? ((element.scrollTop + size.height / 2) / previous.height) * canvasHeight - size.height / 2
      : 0;
    previousSize.current = { width: canvasWidth, height: canvasHeight };
  }, [canvasWidth, canvasHeight, size.width, size.height]);

  const pan = (x: number, y: number) => {
    viewport.current?.scrollBy({ left: x * size.width * 0.25, top: y * size.height * 0.25, behavior: "smooth" });
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded border bg-gray-50" data-vaul-no-drag>
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-1 border-b bg-background p-2" role="toolbar" aria-label="Image controls">
        <Button type="button" variant="ghost" size="icon" aria-label="Zoom out" title="Zoom out" disabled={!ready || zoom <= 1} onClick={() => setZoom(value => Math.max(1, value - 0.25))}><Minus className="h-4 w-4" /></Button>
        <span className="w-14 text-center text-sm tabular-nums" aria-live="polite">{Math.round(zoom * 100)}%</span>
        <Button type="button" variant="ghost" size="icon" aria-label="Zoom in" title="Zoom in" disabled={!ready || zoom >= 5} onClick={() => setZoom(value => Math.min(5, value + 0.25))}><Plus className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" disabled={!ready} onClick={() => setZoom(1)} title="Fit the whole image"><Maximize className="mr-1 h-4 w-4" />Fit</Button>
        <Button type="button" variant="ghost" size="icon" aria-label="Move view left" title="Move view left" disabled={!ready || width <= size.width} onClick={() => pan(-1, 0)}><ArrowLeft className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="icon" aria-label="Move view up" title="Move view up" disabled={!ready || height <= size.height} onClick={() => pan(0, -1)}><ArrowUp className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="icon" aria-label="Move view down" title="Move view down" disabled={!ready || height <= size.height} onClick={() => pan(0, 1)}><ArrowDown className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="icon" aria-label="Move view right" title="Move view right" disabled={!ready || width <= size.width} onClick={() => pan(1, 0)}><ArrowRight className="h-4 w-4" /></Button>
      </div>
      <div
        ref={viewport}
        className="relative min-h-0 flex-1 overflow-auto overscroll-contain"
        style={{ touchAction: "none", cursor: zoom > 1 ? "grab" : "default" }}
        tabIndex={0}
        role="region"
        aria-label={`${title} image preview. Use arrow keys or drag to pan when zoomed.`}
        onKeyDown={event => {
          const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
          if (direction) { event.preventDefault(); pan(direction[0], direction[1]); }
        }}
        onPointerDown={event => {
          if (zoom <= 1 || event.button !== 0) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { x: event.clientX, y: event.clientY, left: event.currentTarget.scrollLeft, top: event.currentTarget.scrollTop };
        }}
        onPointerMove={event => {
          if (!drag.current) return;
          event.currentTarget.scrollLeft = drag.current.left - (event.clientX - drag.current.x);
          event.currentTarget.scrollTop = drag.current.top - (event.clientY - drag.current.y);
        }}
        onPointerUp={() => { drag.current = null; }}
        onPointerCancel={() => { drag.current = null; }}
        onLostPointerCapture={() => { drag.current = null; }}
      >
        {failed && <p role="alert" className="p-4 text-center text-sm">Unable to load this image. Close and reopen the viewer to try again.</p>}
        <div className="relative" style={{ width: canvasWidth, height: canvasHeight }}>
          {/* Signed URLs must be used directly, without an image optimization proxy. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={title}
            draggable={false}
            onLoad={event => setNatural({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
            onError={() => setFailed(true)}
            className="absolute max-w-none select-none"
            style={{ width, height, left: (canvasWidth - width) / 2, top: (canvasHeight - height) / 2, visibility: ready ? "visible" : "hidden" }}
          />
        </div>
      </div>
    </div>
  );
}
