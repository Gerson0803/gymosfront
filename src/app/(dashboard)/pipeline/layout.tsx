"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

export default function PipelineLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="flex h-[calc(100vh-3rem)] min-h-0 flex-col overflow-hidden bg-[#F5F7FB]">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
