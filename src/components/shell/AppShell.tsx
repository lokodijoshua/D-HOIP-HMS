"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { CloseIcon } from "./Icons";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import styles from "./AppShell.module.css";

// Keep in sync with the 1024px desktop breakpoint in AppShell.module.css.
const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";

export function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navigationDialog = useRef<HTMLDialogElement>(null);
  const mainContent = useRef<HTMLElement>(null);
  const [navigationOpen, setNavigationOpen] = useState(false);

  useEffect(() => {
    const desktopQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);

    const closeOnDesktop = () => {
      if (!desktopQuery.matches) {
        return;
      }

      const dialog = navigationDialog.current;
      if (!dialog?.open) {
        return;
      }

      const focusWasInside = dialog.contains(document.activeElement);
      dialog.close();

      if (focusWasInside) {
        mainContent.current?.focus();
      }
    };

    closeOnDesktop();
    desktopQuery.addEventListener("change", closeOnDesktop);

    return () => desktopQuery.removeEventListener("change", closeOnDesktop);
  }, []);

  const openNavigation = () => {
    const dialog = navigationDialog.current;
    if (!dialog || dialog.open) {
      return;
    }

    dialog.showModal();
    setNavigationOpen(true);
  };

  const closeNavigation = () => navigationDialog.current?.close();

  const handleDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) {
      closeNavigation();
    }
  };

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>

      <div className={styles.body}>
        <aside className={styles.desktopSidebar}>
          <Sidebar />
        </aside>

        <div className={styles.workspace}>
          <Header
            onOpenNavigation={openNavigation}
            navigationOpen={navigationOpen}
          />
          <main
            ref={mainContent}
            id="main-content"
            className={styles.main}
            tabIndex={-1}
          >
            <div className={styles.content}>{children}</div>
          </main>
        </div>
      </div>

      <dialog
        ref={navigationDialog}
        id="mobile-navigation"
        className={styles.mobileDialog}
        aria-label="Primary navigation"
        onClick={handleDialogClick}
        onClose={() => setNavigationOpen(false)}
      >
        <div className={styles.mobileHeader}>
          <p className={styles.mobileTitle}>Navigation</p>
          <button
            type="button"
            className={styles.closeButton}
            onClick={closeNavigation}
            aria-label="Close navigation"
          >
            <CloseIcon />
          </button>
        </div>
        <Sidebar onNavigate={closeNavigation} />
      </dialog>
    </div>
  );
}
