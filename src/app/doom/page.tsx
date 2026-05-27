"use client";

import { ArrowLeft } from "lucide-react";

export default function DoomPage() {
  return (
    <div className="fixed inset-0 bg-black">
      <div className="absolute top-4 left-4 z-50 flex gap-2 p-2 bg-black/80 rounded-lg">
        <a
          href="/"
          className="p-2 text-orange-500 hover:text-orange-400 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </a>
      </div>

      <iframe
        src="https://thedoggybrad.github.io/doom_on_js-dos/"
        className="w-full h-full border-0"
        title="DOOM"
        allow="fullscreen"
        allowFullScreen
      />
    </div>
  );
}