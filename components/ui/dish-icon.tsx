export function DishIcon({ size = 48, split = 0.5 }: { size?: number; split?: number }) {
  const clamped = Math.max(0, Math.min(1, split));
  return (
    <span
      aria-hidden="true"
      className="relative inline-block shrink-0 overflow-hidden rounded-full border-2 border-bg shadow-sm"
      style={{ width: size, height: size, background: `linear-gradient(90deg, var(--color-red) ${clamped * 100}%, var(--color-green) ${clamped * 100}%)` }}
    />
  );
}
