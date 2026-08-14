export function AdminPageHeading({ title, description }: { title: string; description: string }) {
  return <div className="mb-6"><h1 className="text-2xl font-semibold text-neutral-900">{title}</h1><p className="mt-1 text-sm text-ink-soft">{description}</p></div>;
}
