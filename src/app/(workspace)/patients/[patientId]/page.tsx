import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PatientProfileView } from "@/components/patients/PatientProfileView";
import { SyntheticNotice } from "@/components/patients/SyntheticNotice";
import styles from "@/components/patients/Patients.module.css";
import { isUuid } from "@/modules/patient-registry/domain/normalization";
import { isPatientPreviewEnabled } from "@/modules/patient-registry/server/preview-guard";
import { getPatientRegistryService } from "@/modules/patient-registry/server/service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Patient record",
};

export default async function PatientRecordPage({
  params,
}: Readonly<{
  params: Promise<{ patientId: string }>;
}>) {
  if (!isPatientPreviewEnabled()) {
    notFound();
  }

  const { patientId } = await params;
  if (!isUuid(patientId)) {
    notFound();
  }

  const patient = getPatientRegistryService().getProfile(patientId);
  if (!patient) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Patient records / Patient record</p>
          <h1 className={styles.title}>Patient record</h1>
          <p className={styles.description}>
            The canonical patient identity and registration provenance for this
            synthetic record. Clinical encounters and financial activity are not
            part of this milestone.
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
      <PatientProfileView patient={patient} />
    </div>
  );
}
