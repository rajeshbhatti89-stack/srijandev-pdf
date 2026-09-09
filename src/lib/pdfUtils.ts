import { PDFDocument, degrees } from "pdf-lib";

export interface TextAnnotation {
  id: string;
  pageIndex: number;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  text: string;
  fontSize: number; // in pt
  fontFamily: "hindi" | "sans" | "serif" | "mono";
  color: string;
  bold: boolean;
  italic: boolean;
}

export interface DrawingPath {
  id: string;
  pageIndex: number;
  points: { x: number; y: number }[]; // percentage (0 - 100)
  color: string;
  width: number;
}

export interface ShapeAnnotation {
  id: string;
  pageIndex: number;
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  height: number; // percentage
  type: "highlight" | "redact" | "box";
  color: string;
}

export interface StampAnnotation {
  id: string;
  pageIndex: number;
  x: number; // percentage
  y: number; // percentage
  title: string;
  subtitle?: string;
  color: string;
}

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  color: string;
  opacity: number;
  fontSize: number;
}

export interface PageInfo {
  pageIndex: number;
  originalIndex: number;
  rotation: number; // 0, 90, 180, 270
  width: number;
  height: number;
  deleted?: boolean;
}

// Load PDF.js client-side dynamically from Cloudflare CDN
export async function getPdfJs(): Promise<any> {
  if (typeof window === "undefined") return null;
  const win = window as any;
  if (win.pdfjsLib) return win.pdfjsLib;

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="pdf.min.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(win.pdfjsLib));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      const lib = win.pdfjsLib;
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve(lib);
      } else {
        reject(new Error("Failed to load PDF.js library"));
      }
    };
    script.onerror = () => reject(new Error("Network error loading PDF.js"));
    document.head.appendChild(script);
  });
}

// Create an initial blank PDF document
export async function createBlankPdf(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  // Add clean blank canvas
  return await pdfDoc.save();
}

// Create a rich sample PDF for instant testing in English and Hindi
export async function createSamplePdf(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
  
  // Render high quality sample onto page via canvas
  const canvas = document.createElement("canvas");
  canvas.width = 1190;
  canvas.height = 1684;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, "#4f46e5");
    grad.addColorStop(1, "#7c3aed");
    ctx.fillStyle = grad;
    ctx.fillRect(80, 80, canvas.width - 160, 140);

    // Header text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px 'Inter', sans-serif";
    ctx.fillText("SRIJANDEV PDF DOCUMENT", 120, 165);

    // Subtitle in English and Hindi
    ctx.font = "28px 'Noto Sans Devanagari', 'Inter', sans-serif";
    ctx.fillText("Online PDF Editor & Viewer • ऑनलाइन पीडीएफ संपादक", 120, 205);

    // Body content
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 34px 'Noto Sans Devanagari', 'Inter', sans-serif";
    ctx.fillText("नमस्ते / Welcome to Srijandev PDF", 80, 310);

    ctx.font = "24px 'Noto Sans Devanagari', 'Inter', sans-serif";
    ctx.fillStyle = "#475569";
    ctx.fillText("This is a live, editable document loaded in your browser.", 80, 360);
    ctx.fillText("आप यहाँ हिंदी (Devanagari) या अंग्रेज़ी (English) में लिख सकते हैं।", 80, 405);
    ctx.fillText("You can add text, signatures, stamps, highlights, and rotate pages.", 80, 450);

    // Boxed section
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 500, canvas.width - 160, 320);

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(82, 502, canvas.width - 164, 316);

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 26px 'Noto Sans Devanagari', 'Inter', sans-serif";
    ctx.fillText("विशेषताएं / Key Features:", 110, 550);

    const items = [
      "✓ Edit text in English & Hindi with full font rendering (पूरा फ़ॉन्ट समर्थन)",
      "✓ Add digital signature and freehand drawings (डिजिटल हस्ताक्षर)",
      "✓ 100% Client-Side Privacy: No files uploaded to external servers",
      "✓ Instant 1-click export directly on pdf.srijandev.in",
      "✓ Page reordering, rotation (90°/180°/270°), and merging"
    ];

    ctx.font = "22px 'Noto Sans Devanagari', 'Inter', sans-serif";
    ctx.fillStyle = "#334155";
    items.forEach((item, idx) => {
      ctx.fillText(item, 110, 600 + idx * 42);
    });

    // Footer note
    ctx.fillStyle = "#94a3b8";
    ctx.font = "20px 'Inter', sans-serif";
    ctx.fillText("Hosted on Cloudflare Pages • Domain: pdf.srijandev.in", 80, 1600);

    const pngUrl = canvas.toDataURL("image/png");
    const pngBytes = await fetch(pngUrl).then((res) => res.arrayBuffer());
    const embedImage = await pdfDoc.embedPng(pngBytes);
    page1.drawImage(embedImage, {
      x: 0,
      y: 0,
      width: 595.28,
      height: 841.89,
    });
  }

  return await pdfDoc.save();
}

// Helper to convert font family to CSS string
export function getFontFamilyCss(family: "hindi" | "sans" | "serif" | "mono"): string {
  switch (family) {
    case "hindi":
      return "'Noto Sans Devanagari', 'Poppins', 'Mangal', sans-serif";
    case "serif":
      return "'Times New Roman', 'Noto Serif Devanagari', serif";
    case "mono":
      return "'Courier New', monospace";
    case "sans":
    default:
      return "'Inter', system-ui, -apple-system, sans-serif";
  }
}

// Export final PDF document burning all annotations & transforms
export async function exportModifiedPdf({
  originalPdfBytes,
  pages,
  textAnnotations,
  drawings,
  shapes,
  stamps,
  watermark,
}: {
  originalPdfBytes: Uint8Array;
  pages: PageInfo[];
  textAnnotations: TextAnnotation[];
  drawings: DrawingPath[];
  shapes: ShapeAnnotation[];
  stamps: StampAnnotation[];
  watermark: WatermarkConfig;
}): Promise<Uint8Array> {
  const sourceDoc = await PDFDocument.load(originalPdfBytes);
  const targetDoc = await PDFDocument.create();

  // Active (non-deleted) pages
  const activePages = pages.filter((p) => !p.deleted);

  for (let i = 0; i < activePages.length; i++) {
    const pageMeta = activePages[i];
    // Copy the original page
    const [copiedPage] = await targetDoc.copyPages(sourceDoc, [pageMeta.originalIndex]);
    const addedPage = targetDoc.addPage(copiedPage);

    // Apply rotation
    if (pageMeta.rotation) {
      const currentRot = addedPage.getRotation().angle;
      addedPage.setRotation(degrees((currentRot + pageMeta.rotation) % 360));
    }

    const pageWidth = addedPage.getWidth();
    const pageHeight = addedPage.getHeight();

    // Check if this page has annotations or watermark
    const pageTexts = textAnnotations.filter((t) => t.pageIndex === pageMeta.pageIndex);
    const pageDrawings = drawings.filter((d) => d.pageIndex === pageMeta.pageIndex);
    const pageShapes = shapes.filter((s) => s.pageIndex === pageMeta.pageIndex);
    const pageStamps = stamps.filter((s) => s.pageIndex === pageMeta.pageIndex);

    const hasWatermark = watermark.enabled && watermark.text.trim().length > 0;
    const hasAnnotations =
      pageTexts.length > 0 ||
      pageDrawings.length > 0 ||
      pageShapes.length > 0 ||
      pageStamps.length > 0 ||
      hasWatermark;

    if (hasAnnotations) {
      // Create high-res transparent offscreen canvas (2x scale for crisp print resolution)
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = pageWidth * scale;
      canvas.height = pageHeight * scale;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.scale(scale, scale);

        // 1. Draw Watermark if enabled
        if (hasWatermark) {
          ctx.save();
          ctx.translate(pageWidth / 2, pageHeight / 2);
          ctx.rotate((-45 * Math.PI) / 180);
          ctx.font = `bold ${watermark.fontSize}px 'Noto Sans Devanagari', 'Inter', sans-serif`;
          ctx.fillStyle = watermark.color;
          ctx.globalAlpha = watermark.opacity;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(watermark.text, 0, 0);
          ctx.restore();
        }

        // 2. Draw Shapes (Highlights & Redactions)
        pageShapes.forEach((shape) => {
          const x = (shape.x / 100) * pageWidth;
          const y = (shape.y / 100) * pageHeight;
          const w = (shape.width / 100) * pageWidth;
          const h = (shape.height / 100) * pageHeight;

          ctx.save();
          if (shape.type === "highlight") {
            ctx.globalAlpha = 0.35;
            ctx.fillStyle = shape.color || "#facc15";
            ctx.fillRect(x, y, w, h);
          } else if (shape.type === "redact") {
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = "#000000";
            ctx.fillRect(x, y, w, h);
          } else {
            ctx.globalAlpha = 1.0;
            ctx.strokeStyle = shape.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, w, h);
          }
          ctx.restore();
        });

        // 3. Draw Drawings / Signatures
        pageDrawings.forEach((drawing) => {
          if (drawing.points.length < 2) return;
          ctx.save();
          ctx.strokeStyle = drawing.color;
          ctx.lineWidth = drawing.width;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          ctx.beginPath();
          const first = drawing.points[0];
          ctx.moveTo((first.x / 100) * pageWidth, (first.y / 100) * pageHeight);

          for (let p = 1; p < drawing.points.length; p++) {
            const pt = drawing.points[p];
            ctx.lineTo((pt.x / 100) * pageWidth, (pt.y / 100) * pageHeight);
          }
          ctx.stroke();
          ctx.restore();
        });

        // 4. Draw Stamps
        pageStamps.forEach((stamp) => {
          const x = (stamp.x / 100) * pageWidth;
          const y = (stamp.y / 100) * pageHeight;
          const stampWidth = 140;
          const stampHeight = 54;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((-8 * Math.PI) / 180);

          // Stamp Border
          ctx.strokeStyle = stamp.color;
          ctx.lineWidth = 3;
          ctx.strokeRect(-stampWidth / 2, -stampHeight / 2, stampWidth, stampHeight);

          // Inner border
          ctx.lineWidth = 1;
          ctx.strokeRect(
            -stampWidth / 2 + 3,
            -stampHeight / 2 + 3,
            stampWidth - 6,
            stampHeight - 6
          );

          // Title
          ctx.fillStyle = stamp.color;
          ctx.font = "bold 15px 'Noto Sans Devanagari', 'Inter', sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(stamp.title, 0, stamp.subtitle ? -8 : 0);

          // Subtitle (e.g. date or hindi subtitle)
          if (stamp.subtitle) {
            ctx.font = "10px 'Noto Sans Devanagari', 'Inter', sans-serif";
            ctx.fillText(stamp.subtitle, 0, 12);
          }
          ctx.restore();
        });

        // 5. Draw Text Annotations (Full Hindi & English font rendering)
        pageTexts.forEach((annotation) => {
          if (!annotation.text) return;
          const x = (annotation.x / 100) * pageWidth;
          const y = (annotation.y / 100) * pageHeight;

          ctx.save();
          const weight = annotation.bold ? "bold " : "";
          const style = annotation.italic ? "italic " : "";
          const fontFam = getFontFamilyCss(annotation.fontFamily);

          ctx.font = `${style}${weight}${annotation.fontSize}px ${fontFam}`;
          ctx.fillStyle = annotation.color;
          ctx.textBaseline = "top";

          // Handle multiline text
          const lines = annotation.text.split("\n");
          lines.forEach((line, lineIdx) => {
            ctx.fillText(line, x, y + lineIdx * (annotation.fontSize * 1.25));
          });
          ctx.restore();
        });

        // Convert canvas to PNG bytes and overlay onto the PDF page
        const pngUrl = canvas.toDataURL("image/png");
        const pngBuffer = await fetch(pngUrl).then((r) => r.arrayBuffer());
        const embeddedLayer = await targetDoc.embedPng(pngBuffer);

        addedPage.drawImage(embeddedLayer, {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
        });
      }
    }
  }

  return await targetDoc.save();
}

// Download blob directly as file in user browser
export function downloadPdf(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
