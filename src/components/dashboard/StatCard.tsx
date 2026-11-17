import type { MetricTone } from "@/lib/demo-data";
import styles from "./StatCard.module.css";

export function StatCard({
  label,
  value,
  detail,
  tone,
}: Readonly<{
  label: string;
  value: string;
  detail: string;
  tone: MetricTone;
}>) {
  return (
    <article className={`${styles.card} ${styles[tone]}`}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
      <p className={styles.detail}>{detail}</p>
    </article>
  );
}
