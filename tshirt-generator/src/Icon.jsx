/** Small stroke icons used across the studio. */
export default function Icon({ name, size = 20, ...props }) {
  const paths = {
    shirt: "M8 3 3 5 1 10l4 2 2-3v12h10V9l2 3 4-2-2-5-5-2c0 4-8 4-8 0Z",
    search: "m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
    arrow: "M5 12h14m-6-6 6 6-6 6",
    download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
    plus: "M12 5v14M5 12h14",
    minus: "M5 12h14",
    up: "m5 15 7-7 7 7",
    down: "m5 9 7 7 7-7",
    fit: "M4 9V4h5m6 0h5v5m0 6v5h-5m-6 0H4v-5m8-5v2m-1-1h2",
    edit: "M4 20h4L19 9l-4-4L4 16v4Zm9-13 4 4",
    left: "m15 5-7 7 7 7",
    right: "m9 5 7 7-7 7",
    check: "m5 12 4 4L19 6",
    close: "m6 6 12 12M6 18 18 6",
    globe:
      "M21 12H3m9-9c5 5 5 13 0 18-5-5-5-13 0-18ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
    layers: "m12 3 10 6-10 6L2 9l10-6Zm-10 11 10 6 10-6",
    link: "m10 13 4-4m-6 7-2 2a4 4 0 0 1-6-6l4-4m12-1 2-2a4 4 0 0 1 6 6l-4 4",
    info: "M12 11v6m0-10v1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
    reset: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5",
    cube: "m12 2 9 5v10l-9 5-9-5V7l9-5Zm0 20V12m9-5-9 5-9-5",
    lock: "M6 11h12v10H6V11Zm2 0V7a4 4 0 0 1 8 0v4",
    unlock: "M6 11h12v10H6V11Zm2 0V7a4 4 0 0 1 7.7-1.5",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.shirt} />
    </svg>
  );
}
