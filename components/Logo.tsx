export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="StaffBase — логотип">
      <rect x="2" y="2" width="44" height="44" rx="10" fill="#113a52" />
      <rect x="12" y="24" width="5.5" height="10" rx="1.4" fill="#c9a13b" />
      <rect x="21" y="15" width="5.5" height="19" rx="1.4" fill="#e8e6e1" />
      <rect x="30" y="28" width="5.5" height="6" rx="1.4" fill="#c9a13b" opacity="0.85" />
    </svg>
  );
}
