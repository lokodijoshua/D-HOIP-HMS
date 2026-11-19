import styles from "./Patients.module.css";

export function SyntheticNotice() {
  return (
    <div className={styles.notice} role="note">
      <strong>Synthetic preview — never enter real patient data.</strong>
      <span>
        Records and audit events in this workspace exist only in server memory
        and reset when the application restarts. They are not stored in a
        database and are not an operational patient registry.
      </span>
    </div>
  );
}
