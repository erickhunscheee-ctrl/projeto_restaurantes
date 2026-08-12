import type { ButtonHTMLAttributes } from "react";

export function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`w-full rounded-xl bg-red px-4 py-3.5 text-base font-semibold text-bg transition-colors hover:bg-primary-600 active:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
  );
}
