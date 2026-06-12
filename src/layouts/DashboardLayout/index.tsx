"use client";

import { DashboardLogo } from "@/components/utilities";
import React, { RefAttributes } from "react";
import { usePathname } from "next/navigation";
import styles from "./styles.module.scss";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useModalTemplate } from "@/components/modals/overlay";
import ConfirmModal from "@/components/secondary/confirmationModal";
import { iconMap } from "@/utils/iconMap";
import { errorToastHandler } from "@/helpers/errorHandler";

type dashboardLinksType = {
  name: string;
  href: string;
  icon: string;
  action?: () => void;
};

export function DashboardLayout({
  user,
  children,
  links,
}: {
  user: "advisor" | "student";
  children: React.ReactNode;
  links: dashboardLinksType[];
}) {
  const url = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isModalOpen, toggleModal } = useModalTemplate(false);

  // Get the logout function
  const { signOut } = useAuth();

  // SIgn out fucntion
  const signOutFunction = (name) => {
    if (name === "Logout") {
      toggleModal();
    }
  };
  const callSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      errorToastHandler(error);
    }
  };

  // Close the mobile drawer on route changes so page transitions stay clean.
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [url]);

  return (
    <div className={styles.wrapper}>
      {/* Core responsive move: expose global nav through a compact toggle on small viewports. */}
      <button
        type="button"
        aria-label={
          isSidebarOpen ? "Close navigation menu" : "Open navigation menu"
        }
        className={styles.mobileMenuButton}
        onClick={() => setIsSidebarOpen((prev) => !prev)}
      >
        {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {isSidebarOpen && (
        <button
          type="button"
          className={styles.mobileOverlay}
          aria-label="Close navigation overlay"
          // Overlay click closes the drawer to mimic native mobile side-panel behavior.
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar below */}
      <aside
        className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ""}`}
      >
        {/* Logo below */}
        <DashboardLogo>
          {user.slice(0, 1).toUpperCase() + user.slice(1)} Portal
        </DashboardLogo>
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {links.map((link) => (
              <li key={link.name} onClick={() => signOutFunction(link.name)}>
                <a
                  href={link.name === "Logout" ? "#" : link.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`${styles.link} ${
                    url === link.href ? styles.linkActive : styles.linkInactive
                  }`}
                >
                  {/* Dynamically render icon based on string name */}
                  {React.createElement(iconMap[link.icon], {
                    size: 17,
                  } as RefAttributes<SVGSVGElement>)}
                  <span className="capitalize">{link.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className={styles.main}>
        <div>{children}</div>
      </main>

      {/* Logout confirmation modal */}
      <ConfirmModal
        message="logout"
        open={isModalOpen}
        onConfirm={() => callSignOut()}
        onCancel={toggleModal}
        title="Logout"
      />
    </div>
  );
}
