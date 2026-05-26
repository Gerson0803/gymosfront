import type { ReactNode } from "react";

export default function ModulesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hidden sm:h-[calc(100vh-8rem)]">
      {children}
    </div>
  );
}
