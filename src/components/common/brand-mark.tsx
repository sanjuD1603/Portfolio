import { useId } from "react";

/**
 * The site's "D" logo: a violet gradient rounded square with a white D. It is the same artwork
 * as the favicon (`src/app/icon.svg`), so the tab icon and the navbar always match.
 *
 * @param className - Sizing and effects, e.g. `size-9`.
 */
export default function BrandMark({ className }: { className?: string }) {
  // The gradient id must be unique per instance, or two marks on a page would share one <defs>.
  const id = useId();
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4f46e5" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill={`url(#${id})`} />
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M10 8H17C23 8 26.5 11.5 26.5 16C26.5 20.5 23 24 17 24H10ZM13.6 11.2V20.8H16.8C20.2 20.8 22.9 19.2 22.9 16C22.9 12.8 20.2 11.2 16.8 11.2Z"
      />
    </svg>
  );
}
