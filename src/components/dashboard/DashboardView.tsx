import { summaryMetrics } from "@/lib/demo-data";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { FoundationStatus } from "./FoundationStatus";
import { OperationalTable } from "./OperationalTable";
import { ServiceCoverage } from "./ServiceCoverage";
import { StatCard } from "./StatCard";
import styles from "./DashboardView.module.css";

export function DashboardView() {
  const context = getWorkspaceContext("/");

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>{context.breadcrumb}</p>
          <h1 className={styles.title}>{context.title}</h1>
          <p className={styles.description}>
            A coordinated view of planned operational activity across the
            hospital. This preview establishes the interface foundation; domain
            workflows are not implemented.
          </p>
        </div>
        <div className={styles.headerMeta}>
          <span>Foundation preview</span>
          <span>Interface v0.1</span>
        </div>
      </header>

      <div className={styles.notice} role="note">
        <strong>Demonstration data</strong>
        <span>
          All figures and records on this page are synthetic. No patient or
          hospital data is shown.
        </span>
      </div>

      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="sr-only">
          Operational summary
        </h2>
        <div className={styles.stats}>
          {summaryMetrics.map((metric) => (
            <StatCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <div className={styles.mainGrid}>
        <OperationalTable />
        <ServiceCoverage />
      </div>

      <FoundationStatus />
    </div>
  );
}
