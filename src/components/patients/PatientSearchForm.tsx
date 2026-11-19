"use client";

import type { FormEvent } from "react";
import styles from "./Patients.module.css";

export function PatientSearchForm({
  idPrefix,
  query,
  dateOfBirth,
  onQueryChange,
  onDateOfBirthChange,
  onSubmit,
  loading,
  error,
}: Readonly<{
  idPrefix: string;
  query: string;
  dateOfBirth: string;
  onQueryChange: (value: string) => void;
  onDateOfBirthChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  error?: string;
}>) {
  const queryId = `${idPrefix}-query`;
  const dobId = `${idPrefix}-dob`;

  return (
    <form
      className={styles.searchGrid}
      onSubmit={onSubmit}
      autoComplete="off"
      aria-label="Patient search"
    >
      <div className={styles.field}>
        <label className={styles.label} htmlFor={queryId}>
          Search patients
        </label>
        <input
          id={queryId}
          className={styles.input}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Name in any order, hospital ID or phone"
          autoComplete="off"
          maxLength={100}
          minLength={2}
          required={!dateOfBirth}
          aria-describedby={
            error ? `${queryId}-hint ${queryId}-error` : `${queryId}-hint`
          }
          aria-invalid={Boolean(error)}
        />
        <p id={`${queryId}-hint`} className={styles.hint}>
          Enter at least two characters, or use an exact date of birth. Name
          order does not matter. Results are capped and show only the fields
          needed to identify a patient.
        </p>
        {error ? (
          <p id={`${queryId}-error`} className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={dobId}>
          Exact date of birth <span className={styles.hint}>(optional)</span>
        </label>
        <input
          id={dobId}
          className={styles.input}
          type="date"
          value={dateOfBirth}
          onChange={(event) => onDateOfBirthChange(event.target.value)}
          autoComplete="off"
        />
      </div>

      <div className={styles.actions}>
        <button
          type="submit"
          className={`${styles.button} ${styles.primary}`}
          disabled={loading}
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>
    </form>
  );
}
