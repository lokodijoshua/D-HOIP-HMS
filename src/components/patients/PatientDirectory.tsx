"use client";

import { useState, type FormEvent } from "react";
import { searchPatientsAction } from "@/modules/patient-registry/server/actions";
import type { PatientSummary } from "@/modules/patient-registry/domain/types";
import { PatientResultsTable } from "./PatientResultsTable";
import { PatientSearchForm } from "./PatientSearchForm";
import styles from "./Patients.module.css";

export function PatientDirectory() {
  const [query, setQuery] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [results, setResults] = useState<PatientSummary[] | null>(null);
  const [capped, setCapped] = useState(false);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(undefined);

    try {
      const response = await searchPatientsAction({
        query,
        dateOfBirth: dateOfBirth || undefined,
      });

      if (response.status === "invalid") {
        setResults(null);
        setSearched(false);
        setError(
          response.errors.query ??
            response.errors.dateOfBirth ??
            "Check the search details.",
        );
        return;
      }

      setResults(response.results);
      setCapped(response.capped);
      setSearched(true);
    } catch {
      setResults(null);
      setSearched(false);
      setError("The synthetic patient search is unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.panel} aria-labelledby="patient-search-heading">
      <div className={styles.panelHeader}>
        <h2 id="patient-search-heading" className={styles.panelTitle}>
          Search the patient record
        </h2>
        <p className={styles.panelDescription}>
          Search by hospital ID, name in any order, phone, or an exact date of
          birth. The directory does not list every patient.
        </p>
      </div>

      <div className={styles.panelBody}>
        <PatientSearchForm
          idPrefix="directory"
          query={query}
          dateOfBirth={dateOfBirth}
          onQueryChange={setQuery}
          onDateOfBirthChange={setDateOfBirth}
          onSubmit={handleSearch}
          loading={loading}
          error={error}
        />

        <div aria-live="polite" className={styles.stack}>
          {loading ? (
            <p className={styles.loading}>Searching synthetic records…</p>
          ) : null}

          {!loading && results === null && !searched ? (
            <p className={styles.empty}>
              Enter at least two characters or an exact date of birth to search.
              Results are capped and only include the fields needed to identify
              a patient.
            </p>
          ) : null}

          {!loading && searched && results ? (
            <>
              <div className={styles.resultMeta}>
                <span>
                  {results.length === 0
                    ? "No patients matched this search."
                    : `${results.length} patient${results.length === 1 ? "" : "s"} found.`}
                </span>
                {capped ? (
                  <span>Showing the first 20 matches. Refine the search.</span>
                ) : null}
              </div>
              <PatientResultsTable
                results={results}
                caption="Synthetic patient search results"
                emptyMessage="No patients matched this search. Check the details or register a new patient."
              />
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
