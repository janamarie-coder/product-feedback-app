// Approximation of the Figma "detective" illustration — a gray line-art
// character with a hat, holding a magnifying glass up to one eye.
// Not an exported Figma asset (none was provided), so this is a
// best-effort stand-in; swap in the real SVG export if you have one.
export default function DetectiveIllustration() {
  return (
    <svg
      viewBox="0 0 120 120"
      width="120"
      height="120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M32 44c0-11 9-25 28-25s28 14 28 25"
        stroke="#C7CCDE"
        strokeWidth="3"
        fill="#EEF0F9"
      />
      <circle cx="60" cy="55" r="27" stroke="#C7CCDE" strokeWidth="3" fill="#F7F8FD" />
      <circle cx="50" cy="55" r="2.5" fill="#C7CCDE" />
      <path
        d="M58 82c-13 0-23 7-23 7h50s-10-7-23-7z"
        stroke="#C7CCDE"
        strokeWidth="3"
        fill="none"
      />
      <circle cx="87" cy="68" r="13" stroke="#C7CCDE" strokeWidth="3" fill="#F7F8FD" />
      <line x1="78" y1="77" x2="67" y2="88" stroke="#C7CCDE" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
