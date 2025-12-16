"use client";

import { DashboardLogo } from "@/components/utilities";
import React, { RefAttributes } from "react";
import { usePathname } from "next/navigation";
import styles from "./styles.module.scss";

type dashboardLinksType = {
  name: string;
  href: string;
  icon: string;
};

export function DashboardLayout({
  children,
  links,
}: {
  children: React.ReactNode;
  links: dashboardLinksType[];
}) {
  const url = usePathname();

  return (
    <div className="flex">
      {/* Sidebar below */}
      <aside className="shadow-lg z-10 fixed inset-y-0">
        {/* Logo below */}
        <DashboardLogo>Advisor Portal</DashboardLogo>
        <nav className="px-16 py-32 w-256 h-[calc(100vh-var(--nav-height))]">
          <ul className={styles.navList}>
            {links.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className={`${styles.link} ${
                    url === link.href ? styles.linkActive : styles.linkInactive
                  }`}
                >
                  {/* Dynamically render icon based on string name */}
                  {/* @ts-ignore */}
                  {React.createElement(
                    require("../../utils/iconMap").iconMap[link.icon],
                    { size: 17 } as RefAttributes<SVGSVGElement>
                  )}
                  <span className="capitalize">{link.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="bg-[var(--color-background-secondary)] !ml-[var(--sidebar-width)]  w-[calc(100%-var(--sidebar-width))] min-h-screen">
        <div>{children}</div>
      </main>
    </div>
  );
}
