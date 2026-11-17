import { coverageAreas } from "@/lib/demo-data";
import { StatusBadge } from "./StatusBadge";
import styles from "./ServiceCoverage.module.css";

export function ServiceCoverage() {
  return (
    <section className={styles.panel} aria-labelledby="coverage-heading">
      <div className={styles.header}>
        <div>
          <h2 id="coverage-heading" className={styles.title}>
            Service coverage
          </h2>
          <p className={styles.description}>
            Planned clinical and shared service areas. These modules are not
            implemented.
          </p>
        </div>
        <StatusBadge label="Planned" tone="planned" />
      </div>

      <ul className={styles.list}>
        {coverageAreas.map((area, index) => (
          <li key={area.name} className={styles.item}>
            <span className={styles.index} aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className={styles.copy}>
              <p className={styles.name}>{area.name}</p>
              <p className={styles.detail}>{area.description}</p>
            </div>
            <StatusBadge label="Planned" tone="planned" />
          </li>
        ))}
      </ul>
    </section>
  );
}
