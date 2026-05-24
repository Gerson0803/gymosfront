import type { ReactNode } from "react";

/** Full viewport height for pipeline: horizontal scroll sits at the bottom edge. */
export default function PipelineLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-3rem)] min-h-[640px] flex-col overflow-hidden bg-[#F5F7FB] pb-16 md:pb-0">
      <div className="flex h-full w-full min-h-0 flex-col overflow-hidden px-0 pt-0">
        {children}
      </div>
    </div>
  );
}
