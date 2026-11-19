import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PatientDirectory } from "@/components/patients/PatientDirectory";
import { SyntheticNotice } from "@/components/patients/SyntheticNotice";
import styles from "@/components/patients/Patients.module.css";
import { isPatientPreviewEnabled } from "@/modules/patient-registry/server/preview-guard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Patient directory",
};

export default function PatientsPage() {
  if (!isPatientPreviewEnabled()) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Patient records / Registry</p>
          <h1 className={styles.title}>Patient directory</h1>
          <p className={styles.description}>
            Search the synthetic central patient record before registering a
            new patient. The directory does not list every patient and returns
            only the fields needed to identify a record.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link
            className={`${styles.button} ${styles.primary}`}
            href="/patients/new"
          >
            Register patient
          </Link>
        </div>
      </header>

      <SyntheticNotice />
      <PatientDirectory />
    </div>
  );
}
