import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PatientRegistration } from "@/components/patients/PatientRegistration";
import { SyntheticNotice } from "@/components/patients/SyntheticNotice";
import styles from "@/components/patients/Patients.module.css";
import { isPatientPreviewEnabled } from "@/modules/patient-registry/server/preview-guard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Register patient",
};

export default function RegisterPatientPage() {
  if (!isPatientPreviewEnabled()) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Patient records / Registration</p>
          <h1 className={styles.title}>Register patient</h1>
          <p className={styles.description}>
            Search first, review possible duplicates, then record the approved
            identity, contact and next-of-kin details. The hospital ID is
            allocated only after a successful synthetic registration.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link
            className={`${styles.button} ${styles.secondary}`}
            href="/patients"
          >
            Back to directory
          </Link>
        </div>
      </header>

      <SyntheticNotice />
      <PatientRegistration />
    </div>
  );
}
