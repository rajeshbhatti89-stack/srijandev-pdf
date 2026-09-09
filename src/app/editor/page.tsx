"use client";

import React from "react";
import dynamic from "next/dynamic";

const PdfEditor = dynamic(() => import("@/components/editor/PdfEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-500">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3" />
      <span className="text-sm">Loading PDF Editor...</span>
    </div>
  ),
});

export default function EditorPage() {
  return <PdfEditor />;
}

