import type { ReactNode } from "react";

/** Full viewport height for pipeline: horizontal scroll sits at the bottom edge. */
export default function PipelineLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 top-0 z-0 flex flex-col overflow-hidden bg-[#F5F7FB] pb-16 md:left-64 md:pb-0">
      <div className="mx-auto flex h-full w-full max-w-[1400px] min-h-0 flex-col overflow-hidden px-4 pt-6 sm:px-6 lg:px-10">
        {children}
      </div>
    </div>
  );
}
