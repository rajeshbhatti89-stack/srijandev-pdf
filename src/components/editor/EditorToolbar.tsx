"use client";

import React, { useRef } from "react";
import {
  MousePointer,
  Type,
  PenTool,
  Highlighter,
  Square,
  Stamp,
  FileSignature,
  RotateCw,
  Plus,
  Trash2,
  Download,
  Upload,
  ZoomIn,
  ZoomOut,
  FolderPlus,
  Droplet,
  Languages,
} from "lucide-react";
import { WatermarkConfig } from "@/lib/pdfUtils";

export type ToolMode = "select" | "text" | "draw" | "highlight" | "redact" | "stamp";

interface EditorToolbarProps {
  toolMode: ToolMode;
  setToolMode: (mode: ToolMode) => void;
  // Text tool options
  textColor: string;
  setTextColor: (color: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  fontFamily: "hindi" | "sans" | "serif" | "mono";
  setFontFamily: (font: "hindi" | "sans" | "serif" | "mono") => void;
  isBold: boolean;
  setIsBold: (b: boolean) => void;
  isItalic: boolean;
  setIsItalic: (i: boolean) => void;
  // Drawing options
  penWidth: number;
  setPenWidth: (w: number) => void;
  penColor: string;
  setPenColor: (c: string) => void;
  // Stamp options
  selectedStamp: { title: string; subtitle?: string; color: string };
  setSelectedStamp: (s: { title: string; subtitle?: string; color: string }) => void;
  // Page actions
  onRotatePage: () => void;
  onAddBlankPage: () => void;
  onDeletePage: () => void;
  onMergePdf: (file: File) => void;
  onOpenNewFile: (file: File) => void;
  // Watermark
  watermark: WatermarkConfig;
  setWatermark: React.Dispatch<React.SetStateAction<WatermarkConfig>>;
  // Export & zoom
  onExport: () => void;
  isExporting: boolean;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  currentPage: number;
  totalPages: number;
}

const STAMP_PRESETS = [
  { title: "APPROVED", subtitle: "स्वीकृत", color: "#16a34a" },
  { title: "CONFIDENTIAL", subtitle: "गोपनीय", color: "#dc2626" },
  { title: "VERIFIED", subtitle: "सत्यापित", color: "#2563eb" },
  { title: "DRAFT", subtitle: "प्रारूप", color: "#d97706" },
  { title: "SIGN HERE", subtitle: "हस्ताक्षर करें", color: "#7c3aed" },
];

export default function EditorToolbar({
  toolMode,
  setToolMode,
  textColor,
  setTextColor,
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  isBold,
  setIsBold,
  isItalic,
  setIsItalic,
  penWidth,
  setPenWidth,
  penColor,
  setPenColor,
  selectedStamp,
  setSelectedStamp,
  onRotatePage,
  onAddBlankPage,
  onDeletePage,
  onMergePdf,
  onOpenNewFile,
  watermark,
  setWatermark,
  onExport,
  isExporting,
  zoom,
  setZoom,
  currentPage,
  totalPages,
}: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mergeInputRef = useRef<HTMLInputElement>(null);
  const [showWatermarkModal, setShowWatermarkModal] = React.useState(false);

  return (
    <div className="flex flex-col border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      {/* Top Main Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 gap-2 overflow-x-auto">
        {/* Left: Tools Group */}
        <div className="flex items-center gap-1">
          {/* Open file buttons */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Open PDF"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700"
          >
            <Upload size={14} />
            <span>Open</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="application/pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onOpenNewFile(file);
              e.target.value = "";
            }}
          />

          <button
            onClick={() => mergeInputRef.current?.click()}
            title="Merge another PDF into this document"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700"
          >
            <FolderPlus size={14} />
            <span>Merge</span>
          </button>
          <input
            type="file"
            ref={mergeInputRef}
            className="hidden"
            accept="application/pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onMergePdf(file);
              e.target.value = "";
            }}
          />

          <div className="h-5 w-[1px] bg-gray-300 dark:bg-gray-700 mx-1" />

          {/* Primary Tools */}
          <button
            onClick={() => setToolMode("select")}
            title="Select & Pan (V)"
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              toolMode === "select"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <MousePointer size={14} />
            <span>Select</span>
          </button>

          <button
            onClick={() => setToolMode("text")}
            title="Add Text in Hindi or English (T)"
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              toolMode === "text"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Type size={14} />
            <span>Text (हिन्दी / EN)</span>
          </button>

          <button
            onClick={() => setToolMode("draw")}
            title="Draw / Sign (D)"
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              toolMode === "draw"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <PenTool size={14} />
            <span>Sign / Draw</span>
          </button>

          <button
            onClick={() => setToolMode("highlight")}
            title="Highlight Text (H)"
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              toolMode === "highlight"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Highlighter size={14} />
            <span>Highlight</span>
          </button>

          <button
            onClick={() => setToolMode("redact")}
            title="Redact / Blackout sensitive info (R)"
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              toolMode === "redact"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Square size={14} className="fill-current" />
            <span>Redact</span>
          </button>

          <button
            onClick={() => setToolMode("stamp")}
            title="Add Stamp (S)"
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              toolMode === "stamp"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Stamp size={14} />
            <span>Stamp</span>
          </button>

          <button
            onClick={() => setShowWatermarkModal(!showWatermarkModal)}
            title="Watermark Settings"
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border ${
              watermark.enabled
                ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-600 dark:text-indigo-400"
                : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Droplet size={14} />
            <span>Watermark {watermark.enabled ? "✓" : ""}</span>
          </button>
        </div>

        {/* Center/Right: Page manipulation & Export */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 text-xs text-gray-600 dark:text-gray-300">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
              className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded"
              title="Zoom out"
            >
              <ZoomOut size={14} />
            </button>
            <span className="px-1.5 font-mono">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
              className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded"
              title="Zoom in"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          <div className="h-5 w-[1px] bg-gray-300 dark:bg-gray-700" />

          {/* Page controls */}
          <button
            onClick={onRotatePage}
            title="Rotate Page 90° Clockwise"
            className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <RotateCw size={15} />
          </button>

          <button
            onClick={onAddBlankPage}
            title="Add New Blank Page"
            className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <Plus size={16} />
          </button>

          <button
            onClick={onDeletePage}
            disabled={totalPages <= 1}
            title="Delete Current Page"
            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg disabled:opacity-30 disabled:pointer-events-none"
          >
            <Trash2 size={15} />
          </button>

          <div className="h-5 w-[1px] bg-gray-300 dark:bg-gray-700" />

          {/* Main Download Button */}
          <button
            onClick={onExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow transition-colors disabled:opacity-60"
          >
            <Download size={14} />
            <span>{isExporting ? "Exporting..." : "Download PDF"}</span>
          </button>
        </div>
      </div>

      {/* Secondary Contextual Options Bar */}
      {toolMode === "text" && (
        <div className="flex items-center gap-3 px-4 py-1.5 bg-indigo-50/60 dark:bg-gray-800/80 border-t border-indigo-100 dark:border-gray-800 text-xs overflow-x-auto">
          <div className="flex items-center gap-1 text-indigo-700 dark:text-indigo-400 font-medium">
            <Languages size={14} />
            <span>Language & Font:</span>
          </div>

          {/* Font Selector: Hindi Devanagari or English */}
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value as any)}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded px-2 py-1 text-xs font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="hindi">🇮🇳 Hindi / हिन्दी (देवनागरी Noto Sans)</option>
            <option value="sans">🇬🇧 English Sans (Inter)</option>
            <option value="serif">Times / Serif (English & Devanagari)</option>
            <option value="mono">Monospace (Code / Fixed)</option>
          </select>

          {/* Size Selector */}
          <div className="flex items-center gap-1">
            <span className="text-gray-500 dark:text-gray-400">Size:</span>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded px-2 py-1 text-xs font-medium"
            >
              {[12, 14, 16, 18, 20, 24, 28, 32, 40, 48].map((s) => (
                <option key={s} value={s}>
                  {s}pt
                </option>
              ))}
            </select>
          </div>

          {/* Style Toggles */}
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
            <button
              onClick={() => setIsBold(!isBold)}
              className={`px-2.5 py-0.5 font-bold ${
                isBold ? "bg-indigo-600 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
              }`}
            >
              B
            </button>
            <button
              onClick={() => setIsItalic(!isItalic)}
              className={`px-2.5 py-0.5 italic ${
                isItalic ? "bg-indigo-600 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
              }`}
            >
              I
            </button>
          </div>

          {/* Color Presets */}
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-gray-500 dark:text-gray-400">Color:</span>
            {["#000000", "#1e40af", "#dc2626", "#16a34a", "#d97706"].map((col) => (
              <button
                key={col}
                onClick={() => setTextColor(col)}
                className={`w-5 h-5 rounded-full border ${
                  textColor === col ? "ring-2 ring-indigo-500 ring-offset-1 scale-110" : "border-gray-300"
                }`}
                style={{ backgroundColor: col }}
              />
            ))}
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-5 h-5 cursor-pointer rounded border-0 p-0"
              title="Custom Color"
            />
          </div>

          <span className="text-gray-400 dark:text-gray-500 ml-auto italic">
            Click anywhere on the PDF page to type text
          </span>
        </div>
      )}

      {toolMode === "draw" && (
        <div className="flex items-center gap-3 px-4 py-1.5 bg-indigo-50/60 dark:bg-gray-800/80 border-t border-indigo-100 dark:border-gray-800 text-xs overflow-x-auto">
          <span className="font-medium text-indigo-700 dark:text-indigo-400">Pen / Signature:</span>

          {/* Width */}
          <div className="flex items-center gap-1">
            <span className="text-gray-500 dark:text-gray-400">Thickness:</span>
            {[2, 4, 7].map((w) => (
              <button
                key={w}
                onClick={() => setPenWidth(w)}
                className={`px-2 py-0.5 rounded border text-xs ${
                  penWidth === w
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                }`}
              >
                {w === 2 ? "Fine (2px)" : w === 4 ? "Medium (4px)" : "Thick (7px)"}
              </button>
            ))}
          </div>

          {/* Color */}
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-gray-500 dark:text-gray-400">Color:</span>
            {["#000000", "#1e40af", "#dc2626", "#16a34a"].map((col) => (
              <button
                key={col}
                onClick={() => setPenColor(col)}
                className={`w-5 h-5 rounded-full border ${
                  penColor === col ? "ring-2 ring-indigo-500 ring-offset-1 scale-110" : "border-gray-300"
                }`}
                style={{ backgroundColor: col }}
              />
            ))}
          </div>

          <span className="text-gray-400 dark:text-gray-500 ml-auto italic">
            Drag mouse or stylus on the page to draw signature or annotations
          </span>
        </div>
      )}

      {toolMode === "stamp" && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50/60 dark:bg-gray-800/80 border-t border-indigo-100 dark:border-gray-800 text-xs overflow-x-auto">
          <span className="font-medium text-indigo-700 dark:text-indigo-400">Choose Stamp:</span>
          {STAMP_PRESETS.map((preset) => {
            const isSelected = selectedStamp.title === preset.title;
            return (
              <button
                key={preset.title}
                onClick={() => setSelectedStamp(preset)}
                className={`px-2.5 py-1 rounded border font-semibold text-xs flex items-center gap-1 transition-all ${
                  isSelected
                    ? "ring-2 ring-offset-1 ring-indigo-500 shadow-sm"
                    : "opacity-80 hover:opacity-100"
                }`}
                style={{
                  color: preset.color,
                  borderColor: preset.color,
                  backgroundColor: `${preset.color}15`,
                }}
              >
                <span>{preset.title}</span>
                <span className="text-[10px] opacity-80 font-normal">({preset.subtitle})</span>
              </button>
            );
          })}
          <span className="text-gray-400 dark:text-gray-500 ml-auto italic">
            Click anywhere on the PDF page to place stamp
          </span>
        </div>
      )}

      {/* Watermark Dialog Popover */}
      {showWatermarkModal && (
        <div className="px-4 py-3 bg-amber-50 dark:bg-gray-800 border-t border-amber-200 dark:border-gray-700 flex flex-wrap items-center gap-4 text-xs">
          <label className="flex items-center gap-2 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={watermark.enabled}
              onChange={(e) => setWatermark((w) => ({ ...w, enabled: e.target.checked }))}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Enable Watermark (English & Hindi supported)</span>
          </label>

          {watermark.enabled && (
            <>
              <div className="flex items-center gap-1">
                <span className="text-gray-600 dark:text-gray-400">Text:</span>
                <input
                  type="text"
                  value={watermark.text}
                  onChange={(e) => setWatermark((w) => ({ ...w, text: e.target.value }))}
                  placeholder="CONFIDENTIAL / गोपनीय"
                  className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded px-2 py-1 text-xs w-48"
                />
              </div>

              {/* Presets in Hindi & English */}
              <div className="flex items-center gap-1">
                {["CONFIDENTIAL", "गोपनीय", "DRAFT", "प्रारूप", "COPY"].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setWatermark((w) => ({ ...w, text: preset }))}
                    className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[11px] hover:bg-gray-300"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <span className="text-gray-600 dark:text-gray-400">Opacity:</span>
                <input
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.05"
                  value={watermark.opacity}
                  onChange={(e) =>
                    setWatermark((w) => ({ ...w, opacity: parseFloat(e.target.value) }))
                  }
                  className="w-20"
                />
                <span>{Math.round(watermark.opacity * 100)}%</span>
              </div>
            </>
          )}

          <button
            onClick={() => setShowWatermarkModal(false)}
            className="ml-auto px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs hover:bg-gray-300"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
