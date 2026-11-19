import type { PatientRecord } from "@/modules/patient-registry/domain/types";
import { formatSexLabel } from "@/modules/patient-registry/domain/normalization";
import { IdentityStatusBadge } from "./IdentityStatusBadge";
import styles from "./Patients.module.css";

export function PatientBanner({
  patient,
  dateOfBirthDisplay,
}: Readonly<{
  patient: PatientRecord;
  dateOfBirthDisplay: string;
}>) {
  const name = [patient.identity.givenName, patient.identity.middleName]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={styles.banner} aria-label="Patient identity">
      <div className={styles.bannerMain}>
        <h2 className={styles.bannerName}>
          {patient.identity.familyName}, {name}
        </h2>
        <span className={styles.bannerId}>{patient.hospitalId}</span>
      </div>

      <div className={styles.bannerMeta}>
        <span>Sex: {formatSexLabel(patient.identity.sex)}</span>
        <span>Date of birth / age: {dateOfBirthDisplay}</span>
        {patient.identity.preferredName ? (
          <span>Preferred name: {patient.identity.preferredName}</span>
        ) : null}
      </div>

      <div className={styles.bannerFlags}>
        <IdentityStatusBadge status={patient.identityStatus} />
        <span className={styles.hint}>Synthetic patient record</span>
      </div>
    </section>
  );
}
