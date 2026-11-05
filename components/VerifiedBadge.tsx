import { Icon } from "./Icon";

/** Shown only on profiles an admin has verified. */
export function VerifiedBadge({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span className={`verified verified-${size}`} title="Verified by Tristate Market">
      <Icon name="ok" size={size === "sm" ? 14 : 16} />
      Verified
    </span>
  );
}
