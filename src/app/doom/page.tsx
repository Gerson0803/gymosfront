"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";

export default function DoomPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  return (
    <div className="fixed inset-0 bg-black">
      <div className="absolute top-4 left-4 z-50 flex gap-2 p-2 bg-black/80 rounded-lg">
        <a
          href="/"
          className="p-2 text-orange-500 hover:text-orange-400 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </a>
        <button
          onClick={toggleFullscreen}
          className="p-2 text-orange-500 hover:text-orange-400 transition-colors"
          aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        >
          {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
        </button>
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