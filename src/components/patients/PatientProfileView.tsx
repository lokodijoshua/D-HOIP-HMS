import type { ReactNode } from "react";
import type { PatientProfile } from "@/modules/patient-registry/domain/types";
import {
  formatPatientDateDisplay,
  formatSexLabel,
} from "@/modules/patient-registry/domain/normalization";
import { IdentityStatusBadge } from "./IdentityStatusBadge";
import { PatientBanner } from "./PatientBanner";
import styles from "./Patients.module.css";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));
}

function DetailItem({
  term,
  children,
}: Readonly<{
  term: string;
  children: ReactNode;
}>) {
  return (
    <div className={styles.detailItem}>
      <dt className={styles.detailTerm}>{term}</dt>
      <dd className={styles.detailValue}>{children}</dd>
    </div>
  );
}

export function PatientProfileView({
  patient,
}: Readonly<{
  patient: PatientProfile;
}>) {
  const dateOfBirthDisplay = formatPatientDateDisplay(patient.identity);
  const duplicateReview = patient.registration.duplicateReview;

  return (
    <div className={styles.stack}>
      <PatientBanner
        patient={patient}
        dateOfBirthDisplay={dateOfBirthDisplay}
      />

      <div className={styles.twoColumn}>
        <section className={styles.section} aria-labelledby="identity-heading">
          <div className={styles.sectionHeader}>
            <h2 id="identity-heading" className={styles.sectionTitle}>
              Identity
            </h2>
          </div>
          <div className={styles.sectionBody}>
            <dl className={styles.detailGrid}>
              <DetailItem term="Family name">
                {patient.identity.familyName}
              </DetailItem>
              <DetailItem term="Given name">
                {patient.identity.givenName}
              </DetailItem>
              <DetailItem term="Middle name">
                {patient.identity.middleName || "Not recorded"}
              </DetailItem>
              <DetailItem term="Preferred name">
                {patient.identity.preferredName || "Not recorded"}
              </DetailItem>
              <DetailItem term="Sex">
                {formatSexLabel(patient.identity.sex)}
              </DetailItem>
              <DetailItem term="Date of birth / age">
                {dateOfBirthDisplay}
              </DetailItem>
              <DetailItem term="Identity status">
                <IdentityStatusBadge status={patient.identityStatus} />
              </DetailItem>
            </dl>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="contact-heading">
          <div className={styles.sectionHeader}>
            <h2 id="contact-heading" className={styles.sectionTitle}>
              Contact
            </h2>
          </div>
          <div className={styles.sectionBody}>
            <dl className={styles.detailGrid}>
              <DetailItem term="Primary phone">
                <span className={styles.mono}>
                  {patient.contact.primaryPhone}
                </span>
              </DetailItem>
              <DetailItem term="Secondary phone">
                {patient.contact.secondaryPhone ? (
                  <span className={styles.mono}>
                    {patient.contact.secondaryPhone}
                  </span>
                ) : (
                  "Not recorded"
                )}
              </DetailItem>
              <DetailItem term="Email">
                {patient.contact.email || "Not recorded"}
              </DetailItem>
            </dl>
          </div>
        </section>
      </div>

      <div className={styles.twoColumn}>
        <section className={styles.section} aria-labelledby="address-heading">
          <div className={styles.sectionHeader}>
            <h2 id="address-heading" className={styles.sectionTitle}>
              Address
            </h2>
          </div>
          <div className={styles.sectionBody}>
            <dl className={styles.detailGrid}>
              <DetailItem term="Address">
                {[patient.address.line1, patient.address.line2]
                  .filter(Boolean)
                  .join(", ")}
              </DetailItem>
              <DetailItem term="City or town">
                {patient.address.city}
              </DetailItem>
              <DetailItem term="State or FCT">
                {patient.address.state}
              </DetailItem>
              <DetailItem term="Postal code">
                {patient.address.postalCode || "Not recorded"}
              </DetailItem>
              <DetailItem term="Country">
                {patient.address.country}
              </DetailItem>
            </dl>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="kin-heading">
          <div className={styles.sectionHeader}>
            <h2 id="kin-heading" className={styles.sectionTitle}>
              Next of kin
            </h2>
          </div>
          <div className={styles.sectionBody}>
            <dl className={styles.detailGrid}>
              <DetailItem term="Full name">
                {patient.nextOfKin.fullName}
              </DetailItem>
              <DetailItem term="Relationship">
                {patient.nextOfKin.relationship}
              </DetailItem>
              <DetailItem term="Phone">
                <span className={styles.mono}>
                  {patient.nextOfKin.phone}
                </span>
              </DetailItem>
            </dl>
          </div>
        </section>
      </div>

      <section className={styles.section} aria-labelledby="registration-heading">
        <div className={styles.sectionHeader}>
          <h2 id="registration-heading" className={styles.sectionTitle}>
            Registration provenance
          </h2>
        </div>
        <div className={styles.sectionBody}>
          <dl className={styles.detailGrid}>
            <DetailItem term="Registered at">
              {formatDateTime(patient.registration.registeredAt)}
            </DetailItem>
            <DetailItem term="Registered by">
              {patient.registration.registeredBy}
            </DetailItem>
            <DetailItem term="Source">
              Synthetic preview (server memory only)
            </DetailItem>
            <DetailItem term="Hospital ID">
              <span className={styles.mono}>{patient.hospitalId}</span>
            </DetailItem>
            <DetailItem term="Duplicate review">
              {duplicateReview
                ? `${duplicateReview.candidateCount} candidate(s); ${
                    duplicateReview.hasStrongCandidate
                      ? "strong candidate bypassed"
                      : "no strong candidate"
                  }`
                : "No candidates at registration"}
            </DetailItem>
            {duplicateReview?.overrideReason ? (
              <DetailItem term="Override reason">
                {duplicateReview.overrideReason}
              </DetailItem>
            ) : null}
          </dl>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="audit-heading">
        <div className={styles.sectionHeader}>
          <h2 id="audit-heading" className={styles.sectionTitle}>
            Illustrative audit history
          </h2>
        </div>
        <div className={styles.sectionBody}>
          <div className={styles.auditList}>
            {patient.auditEvents.map((event) => (
              <div key={event.id} className={styles.auditItem}>
                <p className={styles.auditAction}>{event.action}</p>
                <p className={styles.auditMeta}>
                  {formatDateTime(event.at)} · {event.actor}
                </p>
                <p className={styles.auditDetail}>{event.detail}</p>
              </div>
            ))}
          </div>
          <p className={styles.hint}>
            These in-memory events illustrate provenance only. They are not an
            append-only, tamper-evident or compliant audit trail.
          </p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="encounters-heading">
        <div className={styles.sectionHeader}>
          <h2 id="encounters-heading" className={styles.sectionTitle}>
            Encounters
          </h2>
        </div>
        <div className={styles.sectionBody}>
          <div className={styles.futureArea}>
            <strong>Future encounter area.</strong> Encounter implementation is
            not part of Patient Management M1. Encounters will be patient-centred
            operational records added in a separately approved milestone.
          </div>
        </div>
      </section>
    </div>
  );
}
