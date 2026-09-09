import React from 'react';

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xl shadow-md">
        S
      </div>
      <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
        Srijandev<span className="text-indigo-600">PDF</span>
      </span>
    </div>
  );
}
