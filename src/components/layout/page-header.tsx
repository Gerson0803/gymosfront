"use client";

import type { ReactNode } from "react";
import { SettingsButton } from "./settings-button";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  search?: ReactNode;
  actions?: ReactNode;
  centered?: boolean;
};

export function PageHeader({ title, subtitle, search, actions, centered }: PageHeaderProps) {
  if (centered) {
    return (
      <header className="relative mb-8">
        <div className="absolute right-0 top-0">
          <SettingsButton />
        </div>
        <div className="text-center px-14">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#0A1733] sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-[#5B6475] sm:text-base">{subtitle}</p>
          ) : null}
        </div>
      </header>
    );
  }

  return (
    <header className="mb-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-[#0A1733] sm:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-[#5B6475]">{subtitle}</p> : null}
        </div>
        <SettingsButton />
      </div>

      {(search || actions) && (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {search ? <div className="w-full lg:max-w-xl">{search}</div> : <div className="flex-1" />}
          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
      )}
    </header>
  );
}
