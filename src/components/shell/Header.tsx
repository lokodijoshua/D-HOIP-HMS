"use client";

import { usePathname } from "next/navigation";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { MenuIcon } from "./Icons";
import styles from "./Header.module.css";

export function Header({
  onOpenNavigation,
  navigationOpen,
}: Readonly<{
  onOpenNavigation: () => void;
  navigationOpen: boolean;
}>) {
  const context = getWorkspaceContext(usePathname());

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={onOpenNavigation}
          aria-label="Open navigation"
          aria-controls="mobile-navigation"
          aria-haspopup="dialog"
          aria-expanded={navigationOpen}
        >
          <MenuIcon />
        </button>

        <div className={styles.context}>
          <p className={styles.breadcrumb}>
            <span>D-HOIP</span>
            <span className={styles.breadcrumbDivider} aria-hidden="true">
              /
            </span>
            <span className={styles.breadcrumbContext}>
              {context.breadcrumb}
            </span>
          </p>
          <p className={styles.title}>{context.title}</p>
        </div>

        <div className={styles.meta}>
          <span className={styles.environment}>
            <span className={styles.dot} aria-hidden="true" />
            {context.environment ?? "UI foundation"}
          </span>
          <span className={styles.demo}>Synthetic data</span>
        </div>
      </div>
    </header>
  );
}
