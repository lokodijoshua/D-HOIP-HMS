import { readinessItems } from "@/lib/demo-data";
import { StatusBadge } from "./StatusBadge";
import styles from "./FoundationStatus.module.css";

export function FoundationStatus() {
  return (
    <section className={styles.panel} aria-labelledby="readiness-heading">
      <div className={styles.header}>
        <div>
          <h2 id="readiness-heading" className={styles.title}>
            Foundation status
          </h2>
          <p className={styles.description}>
            What this interface preview includes today.
          </p>
        </div>
        <StatusBadge label="UI foundation only" tone="neutral" />
      </div>

      <dl className={styles.grid}>
        {readinessItems.map((item) => (
          <div key={item.label} className={styles.item}>
            <dt className={styles.label}>{item.label}</dt>
            <dd>
              <StatusBadge label={item.status} tone={item.tone} />
            </dd>
          </div>
        ))}
      </dl>

      <p className={styles.note}>
        CSS tokens and components are a provisional UI foundation; no design
        system or component library has been formally approved. Authentication,
        database access, authorization, clinical records, and financial
        workflows are not implemented in this preview.
      </p>
    </section>
  );
}
