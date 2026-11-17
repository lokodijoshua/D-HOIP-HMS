"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  navigationGroups,
  type NavigationItem,
} from "@/lib/navigation";
import styles from "./Sidebar.module.css";

type NavigationLink = NavigationItem & { href: string };

function matchesPath(pathname: string, href: string) {
  if (pathname === href) {
    return true;
  }

  if (href === "/") {
    return false;
  }

  return pathname.startsWith(`${href}/`);
}

function getActiveItem(
  pathname: string,
  links: readonly NavigationLink[],
): NavigationLink | undefined {
  const exactMatch = links.find((link) => link.href === pathname);
  if (exactMatch) {
    return exactMatch;
  }

  const prefixMatches = links.filter(
    (link) => link.href !== "/" && matchesPath(pathname, link.href),
  );

  return prefixMatches.reduce<NavigationLink | undefined>(
    (longest, link) =>
      longest === undefined || link.href.length > longest.href.length
        ? link
        : longest,
    undefined,
  );
}

export function Sidebar({
  onNavigate,
}: Readonly<{
  onNavigate?: () => void;
}>) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const [navScroll, setNavScroll] = useState({
    scrollable: false,
    atBottom: true,
  });
  const navigationLinks = navigationGroups.flatMap((group) =>
    group.items.filter(
      (item): item is NavigationLink => item.href !== undefined,
    ),
  );
  const activeItem = getActiveItem(pathname, navigationLinks);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) {
      return;
    }

    const updateScrollState = () => {
      setNavScroll({
        scrollable: nav.scrollHeight > nav.clientHeight + 1,
        atBottom: nav.scrollHeight - nav.scrollTop - nav.clientHeight <= 2,
      });
    };

    updateScrollState();

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(nav);
    nav.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      observer.disconnect();
      nav.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  return (
    <div className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.mark} aria-hidden="true">
          DH
        </div>
        <div className={styles.brandCopy}>
          <p className={styles.brandName}>D-HOIP</p>
          <p className={styles.brandSub}>Dare2Care Hospital</p>
        </div>
      </div>

      <nav className={styles.nav} aria-label="Primary" ref={navRef}>
        {navigationGroups.map((group) => (
          <div key={group.label} className={styles.group}>
            <div className={styles.groupHeader}>
              <p className={styles.groupLabel}>{group.label}</p>
              {group.planned ? (
                <span className={styles.groupStatus}>Planned</span>
              ) : null}
            </div>

            <ul className={styles.list}>
              {group.items.map((item) => {
                const isActive = item === activeItem;

                return (
                  <li key={item.label}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className={
                          isActive ? styles.activeItem : styles.navItem
                        }
                        aria-current={isActive ? "page" : undefined}
                        onClick={onNavigate}
                      >
                        <span>{item.label}</span>
                        {isActive ? (
                          <span
                            className={styles.activeMark}
                            aria-hidden="true"
                          />
                        ) : null}
                      </Link>
                    ) : (
                      <span className={styles.plannedItem}>
                        <span>
                          {item.label}
                          <span className="sr-only"> (planned)</span>
                        </span>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {navScroll.scrollable ? (
          <span
            className={`${styles.scrollCue} ${
              navScroll.atBottom ? styles.scrollCueHidden : ""
            }`}
            aria-hidden="true"
          >
            More below
          </span>
        ) : null}
      </nav>

      <div className={styles.footer}>
        <span className={styles.footerDot} aria-hidden="true" />
        <div>
          <p className={styles.footerTitle}>Foundation preview</p>
          <p className={styles.footerText}>
            No production data or security controls.
          </p>
        </div>
      </div>
    </div>
  );
}
