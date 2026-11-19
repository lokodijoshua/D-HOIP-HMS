"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { PatientSummary } from "@/modules/patient-registry/domain/types";
import { formatSexLabel } from "@/modules/patient-registry/domain/normalization";
import { IdentityStatusBadge } from "./IdentityStatusBadge";
import styles from "./Patients.module.css";

export function PatientResultsTable({
  results,
  caption,
  emptyMessage,
}: Readonly<{
  results: PatientSummary[];
  caption: string;
  emptyMessage: string;
}>) {
  const scrollRegion = useRef<HTMLDivElement>(null);
  const scrollHintId = useId();
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const region = scrollRegion.current;
    if (!region) {
      return;
    }

    const updateOverflow = () => {
      setCanScroll(region.scrollWidth > region.clientWidth + 1);
    };

    updateOverflow();

    const observer = new ResizeObserver(updateOverflow);
    observer.observe(region);
    const table = region.querySelector("table");
    if (table) {
      observer.observe(table);
    }
    window.addEventListener("resize", updateOverflow);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateOverflow);
    };
  }, [results]);

  if (results.length === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  return (
    <div className={styles.tableFrame}>
      <div
        ref={scrollRegion}
        className={styles.tableWrap}
        role="region"
        aria-label={caption}
        aria-describedby={canScroll ? scrollHintId : undefined}
        tabIndex={canScroll ? 0 : undefined}
      >
        <table className={styles.table}>
          <caption className={styles.caption}>{caption}</caption>
          <thead>
            <tr>
              <th scope="col">Patient</th>
              <th scope="col">Hospital ID</th>
              <th scope="col">Sex</th>
              <th scope="col">Date of birth / age</th>
              <th scope="col">Primary phone</th>
              <th scope="col">Identity status</th>
              <th scope="col">Record</th>
            </tr>
          </thead>
          <tbody>
            {results.map((patient) => (
              <tr key={patient.id}>
                <td className={styles.patientCell}>
                  {patient.familyName}, {patient.givenName}
                </td>
                <td className={styles.mono}>{patient.hospitalId}</td>
                <td>{formatSexLabel(patient.sex)}</td>
                <td>{patient.dateOfBirthDisplay}</td>
                <td className={styles.mono}>{patient.primaryPhone}</td>
                <td>
                  <IdentityStatusBadge status={patient.identityStatus} />
                </td>
                <td>
                  <Link
                    className={styles.linkButton}
                    href={`/patients/${patient.id}`}
                  >
                    Open record
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canScroll ? (
        <p id={scrollHintId} className={styles.scrollHint}>
          Scroll horizontally to view all columns
        </p>
      ) : null}
    </div>
  );
}
