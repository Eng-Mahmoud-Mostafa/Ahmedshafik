import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  id?: string;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-4", className)}>
      <span className="eyebrow flex items-center gap-3">
        <span
          aria-hidden="true"
          className="inline-block h-px w-8 bg-egypt-red rtl:w-0"
        />
        {eyebrow}
      </span>
      <h2
        id={id}
        className="display-headline text-4xl text-bone sm:text-5xl lg:text-6xl"
      >
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-base leading-relaxed text-bone-muted">
          {description}
        </p>
      ) : null}
    </header>
  );
}

export function SectionShell({
  id,
  children,
  className,
  labelledBy,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "relative scroll-mt-28 border-t border-charcoal-line/70 py-24 sm:py-32",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[88rem] px-5 sm:px-8 lg:px-12">
        {children}
      </div>
    </section>
  );
}