import type { DemoStatusTone } from "@/lib/demo-data";
import styles from "./StatusBadge.module.css";

export function StatusBadge({
  label,
  tone = "neutral",
}: Readonly<{
  label: string;
  tone?: DemoStatusTone;
}>) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      <span className={styles.dot} aria-hidden="true" />
      {label}
    </span>
  );
}
