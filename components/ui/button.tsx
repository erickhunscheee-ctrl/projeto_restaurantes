import type { ButtonHTMLAttributes } from "react";

export function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`w-full rounded-xl bg-neutral-900 px-4 py-3.5 type-light-16 text-bg transition-colors hover:bg-neutral-700 active:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
  );
}
