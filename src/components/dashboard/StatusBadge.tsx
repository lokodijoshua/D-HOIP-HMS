import styles from "./StatusBadge.module.css";

export type StatusTone =
  | "positive"
  | "warning"
  | "critical"
  | "neutral"
  | "planned";

export function StatusBadge({
  label,
  tone = "neutral",
}: Readonly<{
  label: string;
  tone?: StatusTone;
}>) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      <span className={styles.dot} aria-hidden="true" />
      {label}
    </span>
  );
}
