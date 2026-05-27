"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { X, Maximize2, Minimize2 } from "lucide-react";

const KONAMI_CODE = [
  "ArrowUp", "ArrowUp",
  "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight",
  "ArrowLeft", "ArrowRight",
  "b", "a"
];

export default function DoomOverlay() {
  const [showDoom, setShowDoom] = useState(false);
  const [konamiIndex, setKonamiIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const konamiRef = useRef(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const key = e.key;
    const expectedKey = KONAMI_CODE[konamiIndex];

    if (key === expectedKey) {
      const next = konamiIndex + 1;
      if (next >= KONAMI_CODE.length) {
        setShowDoom(true);
        konamiRef.current = 0;
        setKonamiIndex(0);
      } else {
        konamiRef.current = next;
        setKonamiIndex(next);
      }
    } else if (key !== KONAMI_CODE[0]) {
      konamiRef.current = 0;
      setKonamiIndex(0);
    }
  }, [konamiIndex]);

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

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (showDoom) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showDoom]);

  if (!showDoom) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      <div className="absolute top-4 right-4 z-50 flex gap-2 p-2 bg-black/80 rounded-lg">
        <button
          onClick={toggleFullscreen}
          className="p-2 text-orange-500 hover:text-orange-400 transition-colors"
          aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        >
          {isFullscreen ? <Minimize2 className="w-8 h-8" /> : <Maximize2 className="w-8 h-8" />}
        </button>
        <button
          onClick={() => setShowDoom(false)}
          className="p-2 text-red-500 hover:text-red-400 transition-colors"
          aria-label="Cerrar DOOM"
        >
          <X className="w-8 h-8" />
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