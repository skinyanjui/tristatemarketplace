"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

const TABS = [
  { href: "/", label: "Browse", icon: "home" },
  { href: "/account#saved", label: "Saved", icon: "heart" },
  { href: "/post", label: "Post", icon: "plus" },
  { href: "/account", label: "Account", icon: "user" },
];

export function TabBar() {
  const pathname = usePathname();
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname === href.split("#")[0] && !href.includes("#"));
  return (
    <nav className="tabbar" aria-label="Main">
      <div className="tabs">
        {TABS.map((t) => (
          <Link key={t.label} href={t.href} className="tab" aria-current={active(t.href) ? "page" : undefined}>
            <Icon name={t.icon} size={24} stroke={1.8} />
            <span>{t.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
