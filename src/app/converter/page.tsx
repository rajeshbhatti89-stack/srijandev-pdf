import React from 'react';

export default function ConverterPage() {
  return (
    <div className="flex-1 flex flex-col p-8">
      <h1 className="text-2xl font-bold mb-6">PDF Converter</h1>
      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 mb-6">Convert PDF to Word, Excel, and more.</p>
        <div className="flex gap-4 mb-8">
          <select className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-md px-4 py-2">
            <option value="word">PDF to Word (.docx)</option>
            <option value="excel">PDF to Excel (.xlsx)</option>
          </select>
        </div>
        <input type="file" accept="application/pdf" className="text-sm" />
      </div>
    </div>
  );
}
