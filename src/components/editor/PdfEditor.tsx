"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  getPdfJs,
  createBlankPdf,
  createSamplePdf,
  exportModifiedPdf,
  downloadPdf,
  PageInfo,
  TextAnnotation,
  DrawingPath,
  ShapeAnnotation,
  StampAnnotation,
  WatermarkConfig,
  getFontFamilyCss,
} from "@/lib/pdfUtils";
import EditorToolbar, { ToolMode } from "./EditorToolbar";
import PageThumbnails from "./PageThumbnails";
import { FileUp, FilePlus2, Sparkles, AlertCircle, X, Trash2, Move } from "lucide-react";
import { PDFDocument } from "pdf-lib";

export default function PdfEditor() {
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pdfDocProxy, setPdfDocProxy] = useState<any>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [documentName, setDocumentName] = useState<string>("document.pdf");

  // Tool Modes & Configurations
  const [toolMode, setToolMode] = useState<ToolMode>("select");
  const [zoom, setZoom] = useState<number>(1.15);

  // Text Tool State (Hindi / English support)
  const [textColor, setTextColor] = useState<string>("#000000");
  const [fontSize, setFontSize] = useState<number>(18);
  const [fontFamily, setFontFamily] = useState<"hindi" | "sans" | "serif" | "mono">("hindi");
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);

  // Drawing / Signature State
  const [penWidth, setPenWidth] = useState<number>(3);
  const [penColor, setPenColor] = useState<string>("#000000");
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Stamp State
  const [selectedStamp, setSelectedStamp] = useState<{
    title: string;
    subtitle?: string;
    color: string;
  }>({
    title: "APPROVED",
    subtitle: "स्वीकृत",
    color: "#16a34a",
  });

  // Highlight / Redaction State
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);

  // Watermark State
  const [watermark, setWatermark] = useState<WatermarkConfig>({
    enabled: false,
    text: "CONFIDENTIAL / गोपनीय",
    color: "#94a3b8",
    opacity: 0.15,
    fontSize: 48,
  });

  // Annotations Collections
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [drawings, setDrawings] = useState<DrawingPath[]>([]);
  const [shapes, setShapes] = useState<ShapeAnnotation[]>([]);
  const [stamps, setStamps] = useState<StampAnnotation[]>([]);

  // Selection & Dragging State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingItem, setDraggingItem] = useState<{
    id: string;
    type: "text" | "stamp";
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Status & Loading
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Page Canvas Container
  const pageCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Initialize with a sample PDF on mount
  useEffect(() => {
    handleLoadSample();
  }, []);

  // 2. Load PDF bytes into PDF.js document proxy
  const loadPdfBytes = useCallback(async (bytes: Uint8Array, filename?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const pdfjs = await getPdfJs();
      if (!pdfjs) throw new Error("PDF.js failed to load");

      // Load with pdfjs
      const loadingTask = pdfjs.getDocument({ data: bytes.slice(0) });
      const loadedPdf = await loadingTask.promise;
      setPdfDocProxy(loadedPdf);
      setPdfBytes(bytes);

      if (filename) setDocumentName(filename);

      // Create page metadata array
      const numPages = loadedPdf.numPages;
      const initialPages: PageInfo[] = [];
      for (let i = 0; i < numPages; i++) {
        const page = await loadedPdf.getPage(i + 1);
        const viewport = page.getViewport({ scale: 1 });
        initialPages.push({
          pageIndex: i,
          originalIndex: i,
          rotation: 0,
          width: viewport.width,
          height: viewport.height,
        });
      }
      setPages(initialPages);
      setCurrentPageIndex(0);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to load PDF file");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 3. Render current page on canvas
  const renderCurrentPage = useCallback(async () => {
    if (!pdfDocProxy || !pageCanvasRef.current) return;
    const canvas = pageCanvasRef.current;
    const activePages = pages.filter((p) => !p.deleted);
    const currentPageMeta = activePages.find((p) => p.pageIndex === currentPageIndex);
    if (!currentPageMeta) return;

    try {
      const page = await pdfDocProxy.getPage(currentPageMeta.originalIndex + 1);
      const viewport = page.getViewport({
        scale: zoom * 1.5, // 1.5x internal render scale for crispness
        rotation: (page.rotate + currentPageMeta.rotation) % 360,
      });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      await page.render({
        canvasContext: ctx,
        viewport: viewport,
      }).promise;
    } catch (err) {
      console.error("Error rendering page:", err);
    }
  }, [pdfDocProxy, pages, currentPageIndex, zoom]);

  useEffect(() => {
    renderCurrentPage();
  }, [renderCurrentPage]);

  // Thumbnail render helper for left sidebar
  const renderThumbnailCanvas = useCallback(
    async (pageIndex: number, thumbCanvas: HTMLCanvasElement) => {
      if (!pdfDocProxy) return;
      const pageMeta = pages.find((p) => p.pageIndex === pageIndex);
      if (!pageMeta) return;

      try {
        const page = await pdfDocProxy.getPage(pageMeta.originalIndex + 1);
        const viewport = page.getViewport({ scale: 0.25 });
        thumbCanvas.width = viewport.width;
        thumbCanvas.height = viewport.height;
        const ctx = thumbCanvas.getContext("2d");
        if (ctx) {
          await page.render({
            canvasContext: ctx,
            viewport: viewport,
          }).promise;
        }
      } catch (err) {
        console.error("Thumbnail error:", err);
      }
    },
    [pdfDocProxy, pages]
  );

  // File Handlers
  const handleFileUpload = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    await loadPdfBytes(new Uint8Array(arrayBuffer), file.name);
  };

  const handleCreateBlank = async () => {
    const blankBytes = await createBlankPdf();
    await loadPdfBytes(blankBytes, "blank_document.pdf");
    setTextAnnotations([]);
    setDrawings([]);
    setShapes([]);
    setStamps([]);
  };

  const handleLoadSample = async () => {
    const sampleBytes = await createSamplePdf();
    await loadPdfBytes(sampleBytes, "srijandev_sample.pdf");
  };

  // Merge another PDF file
  const handleMergePdf = async (file: File) => {
    if (!pdfBytes) return;
    try {
      setIsLoading(true);
      const incomingBytes = new Uint8Array(await file.arrayBuffer());
      const currentDoc = await PDFDocument.load(pdfBytes);
      const incomingDoc = await PDFDocument.load(incomingBytes);

      const incomingIndices = incomingDoc.getPageIndices();
      const copiedPages = await currentDoc.copyPages(incomingDoc, incomingIndices);
      copiedPages.forEach((cp) => currentDoc.addPage(cp));

      const mergedBytes = await currentDoc.save();
      await loadPdfBytes(mergedBytes, documentName);
    } catch (err: any) {
      setErrorMessage("Could not merge PDF: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Page Operations
  const handleRotateCurrentPage = () => {
    setPages((prev) =>
      prev.map((p) =>
        p.pageIndex === currentPageIndex
          ? { ...p, rotation: (p.rotation + 90) % 360 }
          : p
      )
    );
  };

  const handleAddBlankPage = async () => {
    if (!pdfBytes) return;
    try {
      const currentDoc = await PDFDocument.load(pdfBytes);
      currentDoc.addPage([595.28, 841.89]);
      const newBytes = await currentDoc.save();
      await loadPdfBytes(newBytes, documentName);
      setCurrentPageIndex(pages.length);
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleDeleteCurrentPage = () => {
    const active = pages.filter((p) => !p.deleted);
    if (active.length <= 1) return;

    setPages((prev) =>
      prev.map((p) =>
        p.pageIndex === currentPageIndex ? { ...p, deleted: true } : p
      )
    );

    // Switch to adjacent page
    const nextActive = active.find((p) => p.pageIndex !== currentPageIndex);
    if (nextActive) setCurrentPageIndex(nextActive.pageIndex);
  };

  const handleMovePage = (fromIdx: number, toIdx: number) => {
    const active = [...pages.filter((p) => !p.deleted)];
    const [moved] = active.splice(fromIdx, 1);
    active.splice(toIdx, 0, moved);
    setPages(active);
  };

  // Canvas Interactions: Click / Drag / Draw
  const getRelativeCoords = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const xPct = Math.max(0, Math.min(100, (clientX / rect.width) * 100));
    const yPct = Math.max(0, Math.min(100, (clientY / rect.height) * 100));
    return { x: xPct, y: yPct };
  };

  const handlePageMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") {
      return;
    }

    const { x, y } = getRelativeCoords(e);

    if (toolMode === "text") {
      // Place new text box
      const newText: TextAnnotation = {
        id: "text-" + Date.now(),
        pageIndex: currentPageIndex,
        x,
        y,
        text: fontFamily === "hindi" ? "यहाँ टेक्स्ट लिखें" : "Click to edit text",
        fontSize,
        fontFamily,
        color: textColor,
        bold: isBold,
        italic: isItalic,
      };
      setTextAnnotations((prev) => [...prev, newText]);
      setSelectedId(newText.id);
      setToolMode("select");
      return;
    }

    if (toolMode === "stamp") {
      // Place stamp
      const newStamp: StampAnnotation = {
        id: "stamp-" + Date.now(),
        pageIndex: currentPageIndex,
        x,
        y,
        title: selectedStamp.title,
        subtitle: selectedStamp.subtitle,
        color: selectedStamp.color,
      };
      setStamps((prev) => [...prev, newStamp]);
      setSelectedId(newStamp.id);
      setToolMode("select");
      return;
    }

    if (toolMode === "draw") {
      setIsDrawing(true);
      setCurrentPath([{ x, y }]);
      return;
    }

    if (toolMode === "highlight" || toolMode === "redact") {
      setDragStart({ x, y });
      setDragCurrent({ x, y });
      return;
    }

    // Select mode: clear selection if clicked on blank page
    setSelectedId(null);
  };

  const handlePageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { x, y } = getRelativeCoords(e);

    if (isDrawing && toolMode === "draw") {
      setCurrentPath((prev) => [...prev, { x, y }]);
      return;
    }

    if (dragStart && (toolMode === "highlight" || toolMode === "redact")) {
      setDragCurrent({ x, y });
      return;
    }

    if (draggingItem) {
      if (draggingItem.type === "text") {
        setTextAnnotations((prev) =>
          prev.map((item) =>
            item.id === draggingItem.id
              ? { ...item, x: x - draggingItem.offsetX, y: y - draggingItem.offsetY }
              : item
          )
        );
      } else if (draggingItem.type === "stamp") {
        setStamps((prev) =>
          prev.map((item) =>
            item.id === draggingItem.id
              ? { ...item, x: x - draggingItem.offsetX, y: y - draggingItem.offsetY }
              : item
          )
        );
      }
    }
  };

  const handlePageMouseUp = () => {
    if (isDrawing && toolMode === "draw" && currentPath.length > 1) {
      const newDrawing: DrawingPath = {
        id: "draw-" + Date.now(),
        pageIndex: currentPageIndex,
        points: currentPath,
        color: penColor,
        width: penWidth,
      };
      setDrawings((prev) => [...prev, newDrawing]);
      setCurrentPath([]);
      setIsDrawing(false);
      return;
    }
    setIsDrawing(false);

    if (dragStart && dragCurrent && (toolMode === "highlight" || toolMode === "redact")) {
      const x = Math.min(dragStart.x, dragCurrent.x);
      const y = Math.min(dragStart.y, dragCurrent.y);
      const width = Math.abs(dragCurrent.x - dragStart.x);
      const height = Math.abs(dragCurrent.y - dragStart.y);

      if (width > 0.5 && height > 0.5) {
        const newShape: ShapeAnnotation = {
          id: "shape-" + Date.now(),
          pageIndex: currentPageIndex,
          x,
          y,
          width,
          height,
          type: toolMode === "highlight" ? "highlight" : "redact",
          color: toolMode === "highlight" ? "#facc15" : "#000000",
        };
        setShapes((prev) => [...prev, newShape]);
      }
      setDragStart(null);
      setDragCurrent(null);
      setToolMode("select");
      return;
    }

    setDraggingItem(null);
  };

  // Export Modified PDF
  const handleExport = async () => {
    if (!pdfBytes) return;
    setIsExporting(true);
    setErrorMessage(null);
    try {
      const exportedBytes = await exportModifiedPdf({
        originalPdfBytes: pdfBytes,
        pages,
        textAnnotations,
        drawings,
        shapes,
        stamps,
        watermark,
      });

      const cleanName = documentName.replace(/\.pdf$/i, "") + "_edited.pdf";
      downloadPdf(exportedBytes, cleanName);
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Export error: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Current page dimensions
  const activePages = pages.filter((p) => !p.deleted);
  const currentPageMeta = activePages.find((p) => p.pageIndex === currentPageIndex);
  const currentPageTexts = textAnnotations.filter((t) => t.pageIndex === currentPageIndex);
  const currentPageDrawings = drawings.filter((d) => d.pageIndex === currentPageIndex);
  const currentPageShapes = shapes.filter((s) => s.pageIndex === currentPageIndex);
  const currentPageStamps = stamps.filter((s) => s.pageIndex === currentPageIndex);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-100 dark:bg-gray-950">
      {/* Top Toolbar */}
      <EditorToolbar
        toolMode={toolMode}
        setToolMode={setToolMode}
        textColor={textColor}
        setTextColor={setTextColor}
        fontSize={fontSize}
        setFontSize={setFontSize}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        isBold={isBold}
        setIsBold={setIsBold}
        isItalic={isItalic}
        setIsItalic={setIsItalic}
        penWidth={penWidth}
        setPenWidth={setPenWidth}
        penColor={penColor}
        setPenColor={setPenColor}
        selectedStamp={selectedStamp}
        setSelectedStamp={setSelectedStamp}
        onRotatePage={handleRotateCurrentPage}
        onAddBlankPage={handleAddBlankPage}
        onDeletePage={handleDeleteCurrentPage}
        onMergePdf={handleMergePdf}
        onOpenNewFile={handleFileUpload}
        watermark={watermark}
        setWatermark={setWatermark}
        onExport={handleExport}
        isExporting={isExporting}
        zoom={zoom}
        setZoom={setZoom}
        currentPage={currentPageIndex + 1}
        totalPages={activePages.length}
      />

      {/* Error notification */}
      {errorMessage && (
        <div className="bg-red-500 text-white text-xs px-4 py-2 flex items-center justify-between shadow">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Workspace: Thumbnails sidebar + Interactive Canvas Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Thumbnails */}
        {pdfDocProxy && (
          <PageThumbnails
            pages={pages}
            currentPageIndex={currentPageIndex}
            onSelectPage={setCurrentPageIndex}
            onRotatePage={(idx) => {
              setPages((prev) =>
                prev.map((p) =>
                  p.pageIndex === idx ? { ...p, rotation: (p.rotation + 90) % 360 } : p
                )
              );
            }}
            onDeletePage={(idx) => {
              setPages((prev) =>
                prev.map((p) => (p.pageIndex === idx ? { ...p, deleted: true } : p))
              );
              const remaining = pages.filter((p) => p.pageIndex !== idx && !p.deleted);
              if (remaining[0]) setCurrentPageIndex(remaining[0].pageIndex);
            }}
            onMovePage={handleMovePage}
            renderThumbnailCanvas={renderThumbnailCanvas}
          />
        )}

        {/* Center Canvas Viewport */}
        <div className="flex-1 overflow-auto p-8 flex items-start justify-center relative select-none">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4" />
              <p className="text-sm">Loading PDF document...</p>
            </div>
          ) : !pdfDocProxy ? (
            <div className="flex flex-col items-center justify-center max-w-md p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                <FileUp size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Open a PDF to Start Editing
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Support for editing in Hindi (हिन्दी) and English, drawing signatures, stamps, highlights, and page management.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium cursor-pointer transition-colors">
                  <FileUp size={16} />
                  <span>Choose PDF</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(f);
                    }}
                  />
                </label>
                <button
                  onClick={handleLoadSample}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200 rounded-xl text-sm font-medium transition-colors"
                >
                  <Sparkles size={16} />
                  <span>Load Sample</span>
                </button>
              </div>
            </div>
          ) : (
            /* PDF Document Page Frame */
            <div
              ref={containerRef}
              onMouseDown={handlePageMouseDown}
              onMouseMove={handlePageMouseMove}
              onMouseUp={handlePageMouseUp}
              className="relative bg-white shadow-2xl rounded-sm transition-transform cursor-crosshair overflow-hidden"
              style={{
                width: currentPageMeta ? currentPageMeta.width * zoom : "auto",
                height: currentPageMeta ? currentPageMeta.height * zoom : "auto",
                cursor:
                  toolMode === "select"
                    ? "default"
                    : toolMode === "draw"
                    ? "crosshair"
                    : toolMode === "text"
                    ? "text"
                    : "crosshair",
              }}
            >
              {/* PDF.js Page Canvas */}
              <canvas
                ref={pageCanvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />

              {/* Watermark Overlay (Real-time Preview) */}
              {watermark.enabled && watermark.text && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
                  style={{ opacity: watermark.opacity }}
                >
                  <span
                    className="font-bold whitespace-nowrap"
                    style={{
                      transform: "rotate(-45deg)",
                      fontSize: `${watermark.fontSize * zoom}px`,
                      color: watermark.color,
                      fontFamily: "'Noto Sans Devanagari', 'Inter', sans-serif",
                    }}
                  >
                    {watermark.text}
                  </span>
                </div>
              )}

              {/* Shapes Layer (Highlights & Redactions) */}
              {currentPageShapes.map((shape) => (
                <div
                  key={shape.id}
                  className="absolute group"
                  style={{
                    left: `${shape.x}%`,
                    top: `${shape.y}%`,
                    width: `${shape.width}%`,
                    height: `${shape.height}%`,
                    backgroundColor: shape.color,
                    opacity: shape.type === "highlight" ? 0.35 : 1,
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShapes((prev) => prev.filter((s) => s.id !== shape.id));
                    }}
                    title="Delete highlight"
                    className="absolute -top-3 -right-3 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}

              {/* Active Drag Rectangle for Highlight / Redact */}
              {dragStart && dragCurrent && (
                <div
                  className="absolute pointer-events-none border border-dashed border-indigo-500"
                  style={{
                    left: `${Math.min(dragStart.x, dragCurrent.x)}%`,
                    top: `${Math.min(dragStart.y, dragCurrent.y)}%`,
                    width: `${Math.abs(dragCurrent.x - dragStart.x)}%`,
                    height: `${Math.abs(dragCurrent.y - dragStart.y)}%`,
                    backgroundColor: toolMode === "highlight" ? "#facc15" : "#000000",
                    opacity: toolMode === "highlight" ? 0.35 : 0.8,
                  }}
                />
              )}

              {/* Drawings & Signature SVG Layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {currentPageDrawings.map((drawing) => {
                  if (drawing.points.length < 2) return null;
                  const d = drawing.points
                    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x}% ${p.y}%`)
                    .join(" ");
                  return (
                    <path
                      key={drawing.id}
                      d={d}
                      stroke={drawing.color}
                      strokeWidth={drawing.width * zoom}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                })}

                {/* Current Active Drawing Stroke */}
                {isDrawing && currentPath.length > 1 && (
                  <path
                    d={currentPath
                      .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x}% ${p.y}%`)
                      .join(" ")}
                    stroke={penColor}
                    strokeWidth={penWidth * zoom}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>

              {/* Stamps Layer */}
              {currentPageStamps.map((stamp) => {
                const isSelected = selectedId === stamp.id;
                return (
                  <div
                    key={stamp.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(stamp.id);
                    }}
                    onMouseDown={(e) => {
                      if (toolMode !== "select") return;
                      e.stopPropagation();
                      setSelectedId(stamp.id);
                      const { x, y } = getRelativeCoords(e);
                      setDraggingItem({
                        id: stamp.id,
                        type: "stamp",
                        offsetX: x - stamp.x,
                        offsetY: y - stamp.y,
                      });
                    }}
                    className={`absolute select-none cursor-move group px-3 py-1.5 border-2 rounded ${
                      isSelected ? "ring-2 ring-indigo-500 shadow-md" : ""
                    }`}
                    style={{
                      left: `${stamp.x}%`,
                      top: `${stamp.y}%`,
                      transform: "translate(-50%, -50%) rotate(-8deg)",
                      color: stamp.color,
                      borderColor: stamp.color,
                      backgroundColor: `${stamp.color}15`,
                    }}
                  >
                    <div className="font-bold text-center leading-none text-sm tracking-wide">
                      {stamp.title}
                    </div>
                    {stamp.subtitle && (
                      <div className="text-[10px] text-center font-hindi opacity-90">
                        {stamp.subtitle}
                      </div>
                    )}

                    {isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setStamps((prev) => prev.filter((s) => s.id !== stamp.id));
                          setSelectedId(null);
                        }}
                        className="absolute -top-3 -right-3 p-1 bg-red-600 text-white rounded-full shadow"
                        title="Delete Stamp"
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Text Annotations Layer (Hindi & English) */}
              {currentPageTexts.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(item.id);
                    }}
                    onMouseDown={(e) => {
                      if (
                        (e.target as HTMLElement).tagName === "TEXTAREA" ||
                        toolMode !== "select"
                      )
                        return;
                      e.stopPropagation();
                      setSelectedId(item.id);
                      const { x, y } = getRelativeCoords(e);
                      setDraggingItem({
                        id: item.id,
                        type: "text",
                        offsetX: x - item.x,
                        offsetY: y - item.y,
                      });
                    }}
                    className={`absolute group cursor-move ${
                      isSelected
                        ? "ring-2 ring-indigo-500 bg-white/80 dark:bg-gray-900/80 rounded shadow-md"
                        : "hover:ring-1 hover:ring-indigo-300"
                    }`}
                    style={{
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                    }}
                  >
                    {/* Drag & Delete Controls */}
                    {isSelected && (
                      <div className="absolute -top-6 left-0 flex items-center gap-1 bg-gray-900 text-white rounded px-1.5 py-0.5 text-[10px] z-20 shadow">
                        <Move size={10} />
                        <span className="font-mono">{item.fontFamily}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTextAnnotations((prev) =>
                              prev.filter((t) => t.id !== item.id)
                            );
                            setSelectedId(null);
                          }}
                          className="hover:text-red-400 ml-1"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    )}

                    {/* Textarea for editable text */}
                    <textarea
                      value={item.text}
                      rows={item.text.split("\n").length}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTextAnnotations((prev) =>
                          prev.map((t) => (t.id === item.id ? { ...t, text: val } : t))
                        );
                      }}
                      className="bg-transparent border-0 resize-none outline-none p-1 block leading-tight"
                      style={{
                        fontSize: `${item.fontSize * zoom}px`,
                        color: item.color,
                        fontFamily: getFontFamilyCss(item.fontFamily),
                        fontWeight: item.bold ? "bold" : "normal",
                        fontStyle: item.italic ? "italic" : "normal",
                        width: `${Math.max(80, item.text.length * (item.fontSize * 0.7))}px`,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
