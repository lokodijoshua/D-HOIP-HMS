"use client";

import { useEffect, useRef, useState } from "react";
import { operationalRows } from "@/lib/demo-data";
import { StatusBadge } from "./StatusBadge";
import styles from "./OperationalTable.module.css";

export function OperationalTable() {
  const scrollRegion = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const region = scrollRegion.current;
    if (!region) {
      return;
    }

    const updateOverflow = () => {
      setCanScroll(region.scrollWidth > region.clientWidth + 1);
    };

    updateOverflow();

    const observer = new ResizeObserver(updateOverflow);
    observer.observe(region);
    const table = region.querySelector("table");
    if (table) {
      observer.observe(table);
    }
    window.addEventListener("resize", updateOverflow);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateOverflow);
    };
  }, []);

  return (
    <section className={styles.panel} aria-labelledby="activity-heading">
      <div className={styles.header}>
        <div>
          <h2 id="activity-heading" className={styles.title}>
            Operational activity
          </h2>
          <p className={styles.description}>
            Illustrative queue snapshot across planned service areas.
          </p>
        </div>
        <span className={styles.meta}>Synthetic</span>
      </div>

      <div className={styles.tableFrame}>
        <div
          ref={scrollRegion}
          className={styles.tableWrap}
          role="region"
          aria-label="Operational activity table"
          tabIndex={canScroll ? 0 : undefined}
        >
          <table className={styles.table}>
            <caption className={styles.caption}>
              Synthetic operational records for interface demonstration only.
            </caption>
            <thead>
              <tr>
                <th scope="col" className={styles.referenceHead}>
                  Reference
                </th>
                <th scope="col">Service area</th>
                <th scope="col">Status</th>
                <th scope="col">Updated</th>
              </tr>
            </thead>
            <tbody>
              {operationalRows.map((row) => (
                <tr key={row.reference}>
                  <td className={styles.reference}>{row.reference}</td>
                  <td className={styles.area}>{row.area}</td>
                  <td>
                    <StatusBadge label={row.status} tone={row.tone} />
                  </td>
                  <td className={styles.updated}>{row.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {canScroll ? (
          <p className={styles.scrollHint} aria-hidden="true">
            Scroll horizontally to view all columns
          </p>
        ) : null}
      </div>
    </section>
  );
}
