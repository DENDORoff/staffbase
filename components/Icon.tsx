import type { JSX } from "react";

const paths: Record<string, JSX.Element> = {
  grid: (<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>),
  users: (<><circle cx="9" cy="8" r="3.5" /><path d="M3.5 20c.6-3.5 3-5.5 5.5-5.5S13.9 16.5 14.5 20" /><circle cx="17" cy="9" r="2.6" /><path d="M16 14.6c2.4.3 3.9 2.3 4.3 5.4" /></>),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M5 21c.8-4 3.6-6.2 7-6.2s6.2 2.2 7 6.2" /></>),
  building: (<><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M9 21v-4h6v4" /><path d="M9 8h.01M12 8h.01M15 8h.01M9 12h.01M12 12h.01M15 12h.01" /></>),
  briefcase: (<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><path d="M3 13h18" /></>),
  calendar: (<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>),
  settings: (<><circle cx="12" cy="12" r="3.2" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14 3H9.9L9.5 6a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2l.4 3h4.1l.4-2.7a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.07-.4.1-.8.1-1.2Z" /></>),
  shield: (<><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" /><path d="M9.5 12.5l2 2 3.5-4" /></>),
  search: (<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.8-3.8" /></>),
  logout: (<><path d="M14 4h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-5" /><path d="M10 8l-4 4 4 4M6 12h10" /></>),
  download: (<><path d="M12 4v11" /><path d="m7.5 11 4.5 4.5L16.5 11" /><path d="M4 19.5h16" /></>),
  upload: (<><path d="M12 15V4" /><path d="m7.5 8.5L12 4l4.5 4.5" /><path d="M4 19.5h16" /></>),
  edit: (<><path d="M4 20h4l11-11a2.1 2.1 0 0 0-3-3L5 17l-1 3Z" /><path d="m13.5 6.5 3 3" /></>),
  trash: (<><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6.5 7l1 13a2 2 0 0 0 2 1.8h5a2 2 0 0 0 2-1.8l1-13" /></>),
  plus: (<><path d="M12 5v14M5 12h14" /></>),
  x: (<><path d="M6 6l12 12M18 6L6 18" /></>),
  check: (<><path d="m5 13 4.5 4.5L19 8" /></>),
  sun: (<><circle cx="12" cy="12" r="4" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.5 4.5l1.8 1.8M17.7 17.7l1.8 1.8M19.5 4.5l-1.8 1.8M6.3 17.7l-1.8 1.8" /></>),
  moon: (<><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" /></>),
  monitor: (<><rect x="2.5" y="4" width="19" height="13" rx="2" /><path d="M9 21h6M12 17v4" /></>),
  mail: (<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>),
  arrowRight: (<><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></>),
  alert: (<><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></>),
  file: (<><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v5h5" /></>),
  globe: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 4 5.7 4 9s-1.5 6.4-4 9c-2.5-2.6-4-5.7-4-9s1.5-6.4 4-9Z" /></>),
  chevronDown: (<><path d="m6 9 6 6 6-6" /></>),
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>),
  lock: (<><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>),
};

export type IconName = keyof typeof paths;

export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {paths[name]}
    </svg>
  );
}
