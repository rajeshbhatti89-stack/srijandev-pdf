"use client";

import React, { useEffect, useRef } from "react";
import { RotateCw, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { PageInfo } from "@/lib/pdfUtils";

interface PageThumbnailsProps {
  pages: PageInfo[];
  currentPageIndex: number;
  onSelectPage: (idx: number) => void;
  onRotatePage: (idx: number) => void;
  onDeletePage: (idx: number) => void;
  onMovePage: (from: number, to: number) => void;
  renderThumbnailCanvas: (pageIndex: number, canvas: HTMLCanvasElement) => void;
}

export default function PageThumbnails({
  pages,
  currentPageIndex,
  onSelectPage,
  onRotatePage,
  onDeletePage,
  onMovePage,
  renderThumbnailCanvas,
}: PageThumbnailsProps) {
  const activePages = pages.filter((p) => !p.deleted);

  return (
    <div className="w-52 border-r border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/50 flex flex-col h-full overflow-hidden select-none">
      <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Pages ({activePages.length})
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {activePages.map((page, displayIdx) => {
          const isSelected = page.pageIndex === currentPageIndex;

          return (
            <div
              key={`${page.pageIndex}-${page.rotation}`}
              onClick={() => onSelectPage(page.pageIndex)}
              className={`group relative flex flex-col items-center p-2 rounded-xl cursor-pointer transition-all ${
                isSelected
                  ? "bg-indigo-50/80 dark:bg-indigo-950/40 ring-2 ring-indigo-600 shadow-sm"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800/60"
              }`}
            >
              {/* Thumbnail Container */}
              <div
                className="w-36 h-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-sm overflow-hidden flex items-center justify-center relative transition-transform"
                style={{
                  transform: `rotate(${page.rotation}deg)`,
                }}
              >
                <ThumbnailCanvas
                  pageIndex={page.pageIndex}
                  renderThumbnailCanvas={renderThumbnailCanvas}
                />
              </div>

              {/* Page Footer Info & Quick Actions */}
              <div className="w-full flex items-center justify-between mt-2 px-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Page {displayIdx + 1}
                  {page.rotation > 0 && ` (${page.rotation}°)`}
                </span>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {displayIdx > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMovePage(displayIdx, displayIdx - 1);
                      }}
                      title="Move Page Up"
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
                    >
                      <ArrowUp size={12} />
                    </button>
                  )}

                  {displayIdx < activePages.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMovePage(displayIdx, displayIdx + 1);
                      }}
                      title="Move Page Down"
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
                    >
                      <ArrowDown size={12} />
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRotatePage(page.pageIndex);
                    }}
                    title="Rotate 90°"
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
                  >
                    <RotateCw size={12} />
                  </button>

                  {activePages.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePage(page.pageIndex);
                      }}
                      title="Delete Page"
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-950/50 rounded text-red-500"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ThumbnailCanvas({
  pageIndex,
  renderThumbnailCanvas,
}: {
  pageIndex: number;
  renderThumbnailCanvas: (pageIndex: number, canvas: HTMLCanvasElement) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      renderThumbnailCanvas(pageIndex, canvasRef.current);
    }
  }, [pageIndex, renderThumbnailCanvas]);

  return <canvas ref={canvasRef} className="max-w-full max-h-full object-contain pointer-events-none" />;
}
