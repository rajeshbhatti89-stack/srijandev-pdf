import React from "react";
import {
  FileText,
  Scissors,
  Languages,
  PenTool,
  RotateCw,
  FolderPlus,
  ShieldCheck,
  Zap,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="flex-1 overflow-auto p-6 md:p-10 bg-gray-50/50 dark:bg-gray-950">
      {/* Top Welcome / Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-8 text-white shadow-lg mb-10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-4">
            <Zap size={14} className="text-amber-300" />
            <span>Fast, Secure & 100% Client-Side</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Online PDF Editor & Tools
          </h1>
          <p className="text-indigo-100 text-sm md:text-base leading-relaxed mb-6 font-hindi">
            ऑनलाइन पीडीएफ संपादक • Type in Hindi (देवनागरी) & English, sign contracts, add stamps, rotate pages, and merge documents directly in your browser.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/editor"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-sm shadow transition-all hover:scale-105"
            >
              <span>Launch PDF Editor</span>
              <ArrowRight size={16} />
            </Link>
            <div className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-indigo-100">
              <ShieldCheck size={16} className="text-emerald-300" />
              <span>Zero server upload • Total privacy</span>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Feature Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Link href="/editor" className="block group">
          <div className="h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group-hover:border-indigo-500 flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                <Languages size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Hindi & English Text (हिन्दी पाठ)
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Write notes, comments, and form fields with full Devanagari typography (Noto Sans) and English fonts.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
              <span>Open in Editor</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </Link>

        <Link href="/editor" className="block group">
          <div className="h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group-hover:border-indigo-500 flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                <PenTool size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Digital Signatures & Stamps
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Draw your digital signature directly on documents and drop bilingual stamps (स्वीकृत / Approved).
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
              <span>Sign document</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </Link>

        <Link href="/editor" className="block group">
          <div className="h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group-hover:border-indigo-500 flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
                <FolderPlus size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Rotate, Reorder & Merge
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Rotate pages by 90°, delete unwanted pages, arrange page sequences, or merge multiple PDFs into one.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Organize pages</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </Link>
      </div>

      {/* Domain info footer */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-gray-800 flex items-center justify-center text-indigo-600">
            <FileText size={20} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Srijandev PDF Suite
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Configured for Cloudflare Pages at <span className="font-mono text-indigo-600 dark:text-indigo-400">pdf.srijandev.in</span>
            </p>
          </div>
        </div>
        <Link
          href="/editor"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
        >
          Start Editing Now
        </Link>
      </div>
    </div>
  );
}

