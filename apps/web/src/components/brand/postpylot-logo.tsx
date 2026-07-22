"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

const MARK_SIZES = {
  sm: "size-5",
  md: "size-6",
  lg: "size-8",
  xl: "size-10",
} as const;

const WORD_SIZES = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
} as const;

type LogoSize = keyof typeof MARK_SIZES;

type PostPylotLogoProps = {
  /** `full` = mark + wordmark, `mark` = icon only, `wordmark` = text only */
  variant?: "full" | "mark" | "wordmark";
  size?: LogoSize;
  className?: string;
  /** Hide decorative title when adjacent text already names the brand */
  decorative?: boolean;
};

function LogoMark({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  const reactId = useId();
  const gradId = `pp-logo-grad-${reactId.replace(/:/g, "")}`;

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient
          id={gradId}
          x1="10"
          y1="54"
          x2="54"
          y2="10"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#C8FF00" />
          <stop offset="1" stopColor="#E8FF66" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradId})`}
        fillRule="evenodd"
        d="M16 10c0-2.2 1.8-4 4-4h11c10.5 0 19 8.5 19 19s-8.5 19-19 19h-7v10c0 2.2-1.8 4-4 4s-4-1.8-4-4V10Zm15 26c6.1 0 11-4.9 11-11s-4.9-11-11-11H24v22h7Z"
      />
      <circle cx="48.5" cy="15.5" r="4" fill={`url(#${gradId})`} />
      <circle cx="48.5" cy="15.5" r="1.75" fill="#0A0A0A" />
      <path
        stroke={`url(#${gradId})`}
        strokeWidth="2.75"
        strokeLinecap="round"
        d="M52.5 23c2.6 3.1 4.2 7 4.2 11.3"
        opacity="0.9"
      />
      <path
        stroke={`url(#${gradId})`}
        strokeWidth="2.75"
        strokeLinecap="round"
        d="M56.2 20.2c3.4 3.9 5.5 8.9 5.5 14.4"
        opacity="0.4"
      />
    </svg>
  );
}

function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-heading font-extrabold tracking-tight text-foreground",
        className
      )}
    >
      PostPylot
    </span>
  );
}

/**
 * PostPylot brand logo — autopilot "P" with publish signal arcs.
 */
export function PostPylotLogo({
  variant = "full",
  size = "md",
  className,
  decorative = false,
}: PostPylotLogoProps) {
  if (variant === "mark") {
    return (
      <LogoMark
        className={cn(MARK_SIZES[size], className)}
        title={decorative ? undefined : "PostPylot"}
      />
    );
  }

  if (variant === "wordmark") {
    return <Wordmark className={cn(WORD_SIZES[size], className)} />;
  }

  return (
    <span
      className={cn("inline-flex items-center gap-2", className)}
      aria-label={decorative ? undefined : "PostPylot"}
    >
      <LogoMark className={MARK_SIZES[size]} />
      <Wordmark className={WORD_SIZES[size]} />
    </span>
  );
}
