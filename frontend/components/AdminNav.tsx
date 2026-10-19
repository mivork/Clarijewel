"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function GemIcon() {
  return (
    <Icon>
      <path d="M6 3h12l4 6-10 12L2 9z" />
      <path d="M2 9h20M12 21 8 9l4-6 4 6z" />
    </Icon>
  );
}

export const ADMIN_LINKS = [
  {
    href: "/admin/dashboard",
    label: "ダッシュボード",
    icon: (
      <Icon>
        <path d="M3 11 12 3l9 8" />
        <path d="M5 10v10h14V10" />
      </Icon>
    ),
  },
  {
    href: "/admin/products",
    label: "商品管理",
    icon: (
      <Icon>
        <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
        <path d="m3 8 9 5 9-5M12 13v8" />
      </Icon>
    ),
  },
  {
    href: "/admin/news",
    label: "ニュース管理",
    icon: (
      <Icon>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 8h10M7 12h10M7 16h6" />
      </Icon>
    ),
  },
  {
    href: "/admin/orders",
    label: "注文管理",
    icon: (
      <Icon>
        <circle cx="9" cy="20" r="1.2" />
        <circle cx="18" cy="20" r="1.2" />
        <path d="M2 3h3l2.6 12.2a1 1 0 0 0 1 .8h9.6a1 1 0 0 0 1-.8L21 7H6" />
      </Icon>
    ),
  },
  {
    href: "/admin/coupons",
    label: "クーポン管理",
    icon: (
      <Icon>
        <path d="M3 12V4h8l10 10-8 8z" />
        <circle cx="7.5" cy="8.5" r="1.3" />
      </Icon>
    ),
  },
  {
    href: "/admin/users",
    label: "会員管理",
    icon: (
      <Icon>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
        <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6" />
      </Icon>
    ),
  },
  {
    href: "/admin/consultations",
    label: "相談予約",
    icon: (
      <Icon>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </Icon>
    ),
  },
  {
    href: "/admin/care-requests",
    label: "保証対応",
    icon: (
      <Icon>
        <path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z" />
        <path d="m9 12 2 2 4-4" />
      </Icon>
    ),
  },
  {
    href: "/admin/inquiries",
    label: "お問い合わせ",
    icon: (
      <Icon>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </Icon>
    ),
  },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <a href="/admin/dashboard" className="admin-brand">
        <GemIcon />
        <span>Clarijewel Admin</span>
      </a>
      <nav className="admin-nav">
        {ADMIN_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={pathname === link.href ? "admin-nav-active" : undefined}
          >
            {link.icon}
            <span>{link.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
