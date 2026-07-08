import { clsx } from "clsx";

export function Button({
  className,
  variant = "primary",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <button
      className={clsx(
        "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-3 text-sm font-semibold transition active:scale-[0.98]",
        variant === "primary" && "bg-ink text-white shadow-[0_20px_45px_rgba(15,23,42,0.18)] hover:-translate-y-0.5 hover:bg-black dark:bg-white dark:text-black",
        variant === "secondary" && "border border-black/10 bg-white/80 text-ink shadow-sm hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white",
        variant === "ghost" && "text-muted hover:bg-black/5 dark:hover:bg-white/10",
        className
      )}
      {...props}
    >
      <span className="absolute inset-0 translate-y-full bg-white/20 transition group-hover:translate-y-0" />
      <span className="relative">{children}</span>
    </button>
  );
}
