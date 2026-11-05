import type { ReactNode } from "react";
import { Icon } from "./Icon";

export type Tone = "info" | "ok" | "warn" | "bad";
const ICON: Record<Tone, string> = { info: "info", ok: "ok", warn: "shield", bad: "alert" };

/** A message with a color and icon that say what kind it is: blue info, green done, amber caution, red problem. */
export function Notice({ tone = "info", children, role, className = "" }: { tone?: Tone; children: ReactNode; role?: "alert" | "status"; className?: string }) {
  return (
    <div className={`notice notice-${tone} ${className}`} role={role ?? (tone === "bad" ? "alert" : tone === "ok" ? "status" : undefined)}>
      <Icon name={ICON[tone]} size={18} />
      <div>{children}</div>
    </div>
  );
}
