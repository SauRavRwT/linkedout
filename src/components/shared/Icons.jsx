export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span className="brand-monogram">LO</span>
    </span>
  );
}

export function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4.2 10h11.6m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThemeIcon({ theme }) {
  return theme === "dark" ? (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="3.3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 2.5v1.7m0 11.6v1.7M17.5 10h-1.7M4.2 10H2.5m12.8-5.3-1.2 1.2M5.9 14.1l-1.2 1.2m10.6 0-1.2-1.2M5.9 5.9 4.7 4.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M16.4 12.2A6.7 6.7 0 0 1 7.8 3.6a6.8 6.8 0 1 0 8.6 8.6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="m13.8 3 .4 1.2 1.2.4-1.2.4-.4 1.2-.4-1.2-1.2-.4 1.2-.4.4-1.2Z"
        fill="currentColor"
      />
    </svg>
  );
}
