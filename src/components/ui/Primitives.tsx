import type { ReactNode } from "react";
import type { VerificationStatus } from "@/content/types";
import { cn } from "@/lib/cn";

const badgeStyles: Record<VerificationStatus, string> = {
  verified: "border-gold/45 bg-gold/10 text-gold",
  "owner-approved": "border-egypt-red/45 bg-egypt-red/10 text-egypt-red-soft",
  unverified: "border-charcoal-line bg-charcoal text-bone-faint",
};

export function VerificationBadge({
  status,
  label,
  className,
}: {
  status: VerificationStatus;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.625rem] font-semibold tracking-[0.18em] uppercase rtl:tracking-normal",
        badgeStyles[status],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="inline-block size-1.5 rounded-full bg-current"
      />
      {label}
    </span>
  );
}

export function SourceList({
  sources,
  label,
  className,
}: {
  sources: Array<{ label: string; url: string }>;
  label: string;
  className?: string;
}) {
  if (sources.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap gap-x-5 gap-y-2", className)}>
      {sources.map((source) => (
        <li key={source.url}>
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 text-xs text-bone-faint underline-offset-4 transition-colors hover:text-gold hover:underline"
          >
            <span className="sr-only">{label}: </span>
            {source.label}
            <span aria-hidden="true" className="text-[0.6rem]">
              ↗
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function EmptyState({
  title,
  body,
  children,
  className,
}: {
  title: string;
  body: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-charcoal-line bg-charcoal/40 p-8 sm:p-10",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="mb-5 h-px w-12 bg-gradient-to-r from-egypt-red to-transparent rtl:bg-gradient-to-l"
      />
      <h3 className="text-lg font-semibold text-bone">{title}</h3>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-bone-muted">
        {body}
      </p>
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}