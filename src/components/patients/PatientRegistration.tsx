"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { getLagosDateKey } from "@/modules/patient-registry/domain/dates";
import { normalizeHospitalId } from "@/modules/patient-registry/domain/normalization";
import { NIGERIAN_STATES } from "@/modules/patient-registry/domain/nigeria";
import {
  registerPatientAction,
  searchPatientsAction,
} from "@/modules/patient-registry/server/actions";
import {
  AGE_UNITS,
  SEXES,
  type AgeUnit,
  type DuplicateCandidate,
  type PatientSummary,
  type RegisteredPatientSummary,
  type RegistrationFieldErrors,
  type Sex,
} from "@/modules/patient-registry/domain/types";
import { IdentityStatusBadge } from "./IdentityStatusBadge";
import { PatientResultsTable } from "./PatientResultsTable";
import { PatientSearchForm } from "./PatientSearchForm";
import styles from "./Patients.module.css";

type Phase = "search" | "form" | "duplicate" | "registered";

type FormState = {
  familyName: string;
  givenName: string;
  middleName: string;
  preferredName: string;
  sex: Sex | "";
  ageMode: "exact" | "estimated";
  dateOfBirth: string;
  estimatedAgeValue: string;
  estimatedAgeUnit: AgeUnit;
  estimatedAgeAsOf: string;
  primaryPhone: string;
  secondaryPhone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  nextOfKinName: string;
  nextOfKinRelationship: string;
  nextOfKinPhone: string;
};

const EMPTY_FORM: FormState = {
  familyName: "",
  givenName: "",
  middleName: "",
  preferredName: "",
  sex: "",
  ageMode: "exact",
  dateOfBirth: "",
  estimatedAgeValue: "",
  estimatedAgeUnit: "years",
  estimatedAgeAsOf: "",
  primaryPhone: "",
  secondaryPhone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  nextOfKinName: "",
  nextOfKinRelationship: "",
  nextOfKinPhone: "",
};

const FIELD_LABELS: Record<string, string> = {
  familyName: "Family name",
  givenName: "Given name",
  middleName: "Middle name",
  preferredName: "Preferred name",
  sex: "Sex",
  dateOfBirth: "Exact date of birth",
  estimatedAgeValue: "Estimated age",
  estimatedAgeUnit: "Age unit",
  estimatedAgeAsOf: "Estimate recorded date",
  primaryPhone: "Primary phone",
  secondaryPhone: "Secondary phone",
  email: "Email",
  addressLine1: "Address line 1",
  addressLine2: "Address line 2",
  city: "City or town",
  state: "State or FCT",
  postalCode: "Postal code",
  nextOfKinName: "Next-of-kin name",
  nextOfKinRelationship: "Next-of-kin relationship",
  nextOfKinPhone: "Next-of-kin phone",
};

function createSubmissionKey(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `submission-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function validateClientDetails(form: FormState): RegistrationFieldErrors {
  const errors: RegistrationFieldErrors = {};
  const required = (value: string, key: string) => {
    if (!value.trim()) {
      errors[key] = "This field is required.";
    }
  };

  required(form.familyName, "familyName");
  required(form.givenName, "givenName");
  required(form.sex, "sex");

  if (form.ageMode === "exact") {
    required(form.dateOfBirth, "dateOfBirth");
  } else {
    required(form.estimatedAgeValue, "estimatedAgeValue");
    required(form.estimatedAgeAsOf, "estimatedAgeAsOf");
  }

  required(form.primaryPhone, "primaryPhone");
  required(form.addressLine1, "addressLine1");
  required(form.city, "city");
  required(form.state, "state");
  required(form.nextOfKinName, "nextOfKinName");
  required(form.nextOfKinRelationship, "nextOfKinRelationship");
  required(form.nextOfKinPhone, "nextOfKinPhone");

  return errors;
}

function sexLabel(sex: Sex): string {
  return sex.charAt(0).toUpperCase() + sex.slice(1);
}

function fieldErrorId(field: string): string {
  return `field-${field}-error`;
}

function errorAttributes(errors: RegistrationFieldErrors, field: string) {
  return errors[field]
    ? {
        "aria-invalid": true as const,
        "aria-describedby": fieldErrorId(field),
      }
    : {};
}

function FieldError({
  field,
  errors,
}: Readonly<{
  field: string;
  errors: RegistrationFieldErrors;
}>) {
  const message = errors[field];
  return message ? (
    <p id={fieldErrorId(field)} className={styles.error}>
      {message}
    </p>
  ) : null;
}

function ErrorSummary({
  errors,
}: Readonly<{
  errors: RegistrationFieldErrors;
}>) {
  const summary = useRef<HTMLDivElement>(null);
  const entries = Object.entries(errors);
  const errorKey = entries.map(([key]) => key).join("|");

  useEffect(() => {
    if (entries.length > 0) {
      summary.current?.focus();
    }
  }, [entries.length, errorKey]);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div
      ref={summary}
      className={styles.errorSummary}
      role="alert"
      tabIndex={-1}
    >
      <p className={styles.errorSummaryTitle}>
        Check the registration details
      </p>
      <ul>
        {entries.map(([key, message]) => (
          <li key={key}>
            {FIELD_LABELS[key] ? (
              <a href={`#field-${key}`}>
                {FIELD_LABELS[key]}: {message}
              </a>
            ) : (
              message
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PatientRegistration() {
  const [phase, setPhase] = useState<Phase>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDateOfBirth, setSearchDateOfBirth] = useState("");
  const [searchResults, setSearchResults] = useState<PatientSummary[] | null>(
    null,
  );
  const [searchCapped, setSearchCapped] = useState(false);
  const [assertedHospitalId, setAssertedHospitalId] = useState("");
  const [exactHospitalIdMatchFound, setExactHospitalIdMatchFound] =
    useState(false);
  const [searched, setSearched] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | undefined>();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<RegistrationFieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [submissionKey, setSubmissionKey] = useState("");
  const [candidates, setCandidates] = useState<DuplicateCandidate[]>([]);
  const [hasStrongCandidate, setHasStrongCandidate] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [overrideError, setOverrideError] = useState<string | undefined>();
  const [registered, setRegistered] =
    useState<RegisteredPatientSummary | null>(null);
  const formHeading = useRef<HTMLHeadingElement>(null);
  const duplicateHeading = useRef<HTMLHeadingElement>(null);
  const successHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      estimatedAgeAsOf: getLagosDateKey(),
    }));
    setSubmissionKey(createSubmissionKey());
  }, []);

  useEffect(() => {
    if (phase === "form") {
      formHeading.current?.focus();
    } else if (phase === "duplicate") {
      duplicateHeading.current?.focus();
    } else if (phase === "registered") {
      successHeading.current?.focus();
    }
  }, [phase]);

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const buildRegistrationInput = () => ({
    familyName: form.familyName,
    givenName: form.givenName,
    middleName: form.middleName,
    preferredName: form.preferredName,
    sex: form.sex,
    dateOfBirth: form.ageMode === "exact" ? form.dateOfBirth : "",
    estimatedAgeValue:
      form.ageMode === "estimated" ? form.estimatedAgeValue : "",
    estimatedAgeUnit:
      form.ageMode === "estimated" ? form.estimatedAgeUnit : "",
    estimatedAgeAsOf:
      form.ageMode === "estimated" ? form.estimatedAgeAsOf : "",
    primaryPhone: form.primaryPhone,
    secondaryPhone: form.secondaryPhone,
    email: form.email,
    addressLine1: form.addressLine1,
    addressLine2: form.addressLine2,
    city: form.city,
    state: form.state,
    postalCode: form.postalCode,
    nextOfKinName: form.nextOfKinName,
    nextOfKinRelationship: form.nextOfKinRelationship,
    nextOfKinPhone: form.nextOfKinPhone,
  });

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchLoading(true);
    setSearchError(undefined);

    try {
      const response = await searchPatientsAction({
        query: searchQuery,
        dateOfBirth: searchDateOfBirth || undefined,
      });

      if (response.status === "invalid") {
        setSearchResults(null);
        setSearchCapped(false);
        setAssertedHospitalId("");
        setExactHospitalIdMatchFound(false);
        setSearched(false);
        setSearchError(
          response.errors.query ??
            response.errors.dateOfBirth ??
            "Check the search details.",
        );
        return;
      }

      const exactHospitalId = normalizeHospitalId(searchQuery);
      setSearchResults(response.results);
      setSearchCapped(response.capped);
      setAssertedHospitalId(exactHospitalId);
      setExactHospitalIdMatchFound(
        Boolean(
          exactHospitalId &&
            response.results.some(
              (patient) => patient.hospitalId === exactHospitalId,
            ),
        ),
      );
      setSearched(true);
    } catch {
      setSearchResults(null);
      setSearchCapped(false);
      setAssertedHospitalId("");
      setExactHospitalIdMatchFound(false);
      setSearched(false);
      setSearchError("The synthetic patient search is unavailable.");
    } finally {
      setSearchLoading(false);
    }
  };

  const continueToRegistration = () => {
    if (!searched || exactHospitalIdMatchFound) {
      return;
    }

    setErrors({});
    setPhase("form");
  };

  const submitRegistration = async (options: {
    duplicateReviewAcknowledged?: boolean;
    overrideReason?: string;
  }) => {
    setLoading(true);
    setErrors({});
    setOverrideError(undefined);

    try {
      const response = await registerPatientAction(buildRegistrationInput(), {
        ...options,
        assertedHospitalId: assertedHospitalId || undefined,
        submissionKey,
      });

      if (response.status === "registered") {
        setRegistered(response.patient);
        setCandidates([]);
        setPhase("registered");
        return;
      }

      if (response.status === "invalid") {
        setErrors(response.errors);
        setPhase("form");
        return;
      }

      setCandidates(response.candidates);
      setHasStrongCandidate(response.hasStrongCandidate);
      setOverrideError(response.overrideReasonError);
      setPhase("duplicate");
    } catch {
      setErrors({
        form: "The synthetic patient registration is unavailable.",
      });
      setPhase("form");
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const clientErrors = validateClientDetails(form);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    void submitRegistration({});
  };

  const handleDuplicateConfirm = () => {
    void submitRegistration({
      duplicateReviewAcknowledged: true,
      overrideReason,
    });
  };

  const resetFlow = () => {
    setPhase("search");
    setSearchQuery("");
    setSearchDateOfBirth("");
    setSearchResults(null);
    setSearchCapped(false);
    setAssertedHospitalId("");
    setExactHospitalIdMatchFound(false);
    setSearched(false);
    setSearchError(undefined);
    setForm({ ...EMPTY_FORM, estimatedAgeAsOf: getLagosDateKey() });
    setErrors({});
    setCandidates([]);
    setHasStrongCandidate(false);
    setOverrideReason("");
    setOverrideError(undefined);
    setRegistered(null);
    setSubmissionKey(createSubmissionKey());
  };

  return (
    <div className={styles.stack}>
      {phase === "search" ? (
        <section className={styles.panel} aria-labelledby="registration-stage">
          <div className={styles.panelHeader}>
            <h2 id="registration-stage" className={styles.panelTitle}>
              1. Search before registering
            </h2>
            <p className={styles.panelDescription}>
              Search for an existing patient first. A duplicate review is
              required before a new synthetic record can be created.
            </p>
          </div>
          <div className={styles.panelBody}>
            <PatientSearchForm
              idPrefix="registration"
              query={searchQuery}
              dateOfBirth={searchDateOfBirth}
              onQueryChange={setSearchQuery}
              onDateOfBirthChange={setSearchDateOfBirth}
              onSubmit={handleSearch}
              loading={searchLoading}
              error={searchError}
            />

            <div className={styles.stack} aria-live="polite">
              {searchLoading ? (
                <p className={styles.loading}>Searching synthetic records...</p>
              ) : null}

              {!searchLoading && !searched ? (
                <p className={styles.empty}>
                  Complete a search to continue. If no existing patient
                  matches, you can start a new registration.
                </p>
              ) : null}

              {!searchLoading && searched ? (
                <>
                  <div className={styles.resultMeta}>
                    <span>
                      {searchResults?.length === 0
                        ? "No patients matched this search."
                        : `${searchResults?.length ?? 0} patient${searchResults?.length === 1 ? "" : "s"} found.`}
                    </span>
                    {searchCapped ? (
                      <span>
                        Showing the first 20 matches. Refine the search.
                      </span>
                    ) : null}
                  </div>

                  <PatientResultsTable
                    results={searchResults ?? []}
                    caption="Synthetic duplicate-check results"
                    emptyMessage="No patients matched this search. Continue only if you are satisfied that this is a new patient."
                  />

                  {phase === "search" && exactHospitalIdMatchFound ? (
                    <p className={styles.noticeInline} role="status">
                      An exact hospital ID matched. Open the existing record; a
                      new registration cannot use an existing hospital ID.
                    </p>
                  ) : null}

                  {phase === "search" && !exactHospitalIdMatchFound ? (
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={`${styles.button} ${styles.primary}`}
                        onClick={continueToRegistration}
                      >
                        None of these — continue registration
                      </button>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {phase === "form" ? (
        <section className={styles.panel} aria-labelledby="registration-form">
          <div className={styles.panelHeader}>
            <h2
              id="registration-form"
              className={styles.panelTitle}
              ref={formHeading}
              tabIndex={-1}
            >
              2. Patient details
            </h2>
            <p className={styles.panelDescription}>
              New records are created with identity status Pending in this
              preview. Identity documents are not uploaded or verified.
            </p>
          </div>

          <div className={styles.panelBody}>
            <ErrorSummary errors={errors} />

            <form
              className={styles.form}
              onSubmit={handleRegistrationSubmit}
              autoComplete="off"
              noValidate
            >
              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Identity</legend>
                <div className={styles.fieldGrid}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="field-familyName">
                      Family name <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="field-familyName"
                      className={styles.input}
                      value={form.familyName}
                      onChange={(event) =>
                        updateField("familyName", event.target.value)
                      }
                      maxLength={100}
                      autoComplete="off"
                      required
                      {...errorAttributes(errors, "familyName")}
                    />
                    <FieldError field="familyName" errors={errors} />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="field-givenName">
                      Given name <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="field-givenName"
                      className={styles.input}
                      value={form.givenName}
                      onChange={(event) =>
                        updateField("givenName", event.target.value)
                      }
                      maxLength={100}
                      autoComplete="off"
                      required
                      {...errorAttributes(errors, "givenName")}
                    />
                    <FieldError field="givenName" errors={errors} />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="field-middleName">
                      Middle name
                    </label>
                    <input
                      id="field-middleName"
                      className={styles.input}
                      value={form.middleName}
                      onChange={(event) =>
                        updateField("middleName", event.target.value)
                      }
                      maxLength={100}
                      autoComplete="off"
                      {...errorAttributes(errors, "middleName")}
                    />
                    <FieldError field="middleName" errors={errors} />
                  </div>

                  <div className={styles.field}>
                    <label
                      className={styles.label}
                      htmlFor="field-preferredName"
                    >
                      Preferred name
                    </label>
                    <input
                      id="field-preferredName"
                      className={styles.input}
                      value={form.preferredName}
                      onChange={(event) =>
                        updateField("preferredName", event.target.value)
                      }
                      maxLength={100}
                      autoComplete="off"
                      {...errorAttributes(errors, "preferredName")}
                    />
                    <FieldError field="preferredName" errors={errors} />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="field-sex">
                      Sex <span className={styles.required}>*</span>
                    </label>
                    <select
                      id="field-sex"
                      className={styles.select}
                      value={form.sex}
                      onChange={(event) =>
                        updateField("sex", event.target.value as Sex | "")
                      }
                      required
                      {...errorAttributes(errors, "sex")}
                    >
                      <option value="">Select sex</option>
                      {SEXES.map((sex) => (
                        <option key={sex} value={sex}>
                          {sexLabel(sex)}
                        </option>
                      ))}
                    </select>
                    <FieldError field="sex" errors={errors} />
                  </div>

                  <div className={`${styles.field} ${styles.full}`}>
                    <span className={styles.label}>
                      Date of birth or estimated age{" "}
                      <span className={styles.required}>*</span>
                    </span>
                    <div className={styles.actions}>
                      <label>
                        <input
                          type="radio"
                          name="ageMode"
                          checked={form.ageMode === "exact"}
                          onChange={() => updateField("ageMode", "exact")}
                        />{" "}
                        Exact date of birth
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="ageMode"
                          checked={form.ageMode === "estimated"}
                          onChange={() =>
                            updateField("ageMode", "estimated")
                          }
                        />{" "}
                        Estimated age
                      </label>
                    </div>
                    <p className={styles.hint}>
                      An estimated age is stored as an estimate with its as-of
                      date. It is never converted into an exact date of birth.
                    </p>
                  </div>

                  {form.ageMode === "exact" ? (
                    <div className={styles.field}>
                      <label
                        className={styles.label}
                        htmlFor="field-dateOfBirth"
                      >
                        Exact date of birth{" "}
                        <span className={styles.required}>*</span>
                      </label>
                      <input
                        id="field-dateOfBirth"
                        className={styles.input}
                        type="date"
                        value={form.dateOfBirth}
                        onChange={(event) =>
                          updateField("dateOfBirth", event.target.value)
                        }
                        required
                        {...errorAttributes(errors, "dateOfBirth")}
                      />
                      <FieldError field="dateOfBirth" errors={errors} />
                    </div>
                  ) : (
                    <>
                      <div className={styles.field}>
                        <label
                          className={styles.label}
                          htmlFor="field-estimatedAgeValue"
                        >
                          Estimated age{" "}
                          <span className={styles.required}>*</span>
                        </label>
                        <input
                          id="field-estimatedAgeValue"
                          className={styles.input}
                          type="number"
                          min="1"
                          step="1"
                          value={form.estimatedAgeValue}
                          onChange={(event) =>
                            updateField(
                              "estimatedAgeValue",
                              event.target.value,
                            )
                          }
                          required
                          {...errorAttributes(errors, "estimatedAgeValue")}
                        />
                        <FieldError
                          field="estimatedAgeValue"
                          errors={errors}
                        />
                      </div>

                      <div className={styles.field}>
                        <label
                          className={styles.label}
                          htmlFor="field-estimatedAgeUnit"
                        >
                          Age unit
                        </label>
                        <select
                          id="field-estimatedAgeUnit"
                          className={styles.select}
                          value={form.estimatedAgeUnit}
                          onChange={(event) =>
                            updateField(
                              "estimatedAgeUnit",
                              event.target.value as AgeUnit,
                            )
                          }
                          {...errorAttributes(errors, "estimatedAgeUnit")}
                        >
                          {AGE_UNITS.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                        <FieldError
                          field="estimatedAgeUnit"
                          errors={errors}
                        />
                      </div>

                      <div className={styles.field}>
                        <label
                          className={styles.label}
                          htmlFor="field-estimatedAgeAsOf"
                        >
                          Estimate recorded as of{" "}
                          <span className={styles.required}>*</span>
                        </label>
                        <input
                          id="field-estimatedAgeAsOf"
                          className={styles.input}
                          type="date"
                          value={form.estimatedAgeAsOf}
                          onChange={(event) =>
                            updateField(
                              "estimatedAgeAsOf",
                              event.target.value,
                            )
                          }
                          required
                          {...errorAttributes(errors, "estimatedAgeAsOf")}
                        />
                        <FieldError
                          field="estimatedAgeAsOf"
                          errors={errors}
                        />
                      </div>
                    </>
                  )}
                </div>
              </fieldset>

              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Contact and address</legend>
                <div className={styles.fieldGrid}>
                  <div className={styles.field}>
                    <label
                      className={styles.label}
                      htmlFor="field-primaryPhone"
                    >
                      Primary phone <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="field-primaryPhone"
                      className={styles.input}
                      type="tel"
                      inputMode="tel"
                      value={form.primaryPhone}
                      onChange={(event) =>
                        updateField("primaryPhone", event.target.value)
                      }
                      maxLength={40}
                      autoComplete="off"
                      required
                      {...errorAttributes(errors, "primaryPhone")}
                    />
                    <p className={styles.hint}>
                      Use a Nigerian number with a leading 0 or +234, or a full
                      international number.
                    </p>
                    <FieldError field="primaryPhone" errors={errors} />
                  </div>

                  <div className={styles.field}>
                    <label
                      className={styles.label}
                      htmlFor="field-secondaryPhone"
                    >
                      Secondary phone
                    </label>
                    <input
                      id="field-secondaryPhone"
                      className={styles.input}
                      type="tel"
                      inputMode="tel"
                      value={form.secondaryPhone}
                      onChange={(event) =>
                        updateField("secondaryPhone", event.target.value)
                      }
                      maxLength={40}
                      autoComplete="off"
                      {...errorAttributes(errors, "secondaryPhone")}
                    />
                    <FieldError field="secondaryPhone" errors={errors} />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="field-email">
                      Email
                    </label>
                    <input
                      id="field-email"
                      className={styles.input}
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      maxLength={254}
                      autoComplete="off"
                      {...errorAttributes(errors, "email")}
                    />
                    <FieldError field="email" errors={errors} />
                  </div>

                  <div className={`${styles.field} ${styles.full}`}>
                    <label
                      className={styles.label}
                      htmlFor="field-addressLine1"
                    >
                      Address line 1 <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="field-addressLine1"
                      className={styles.input}
                      value={form.addressLine1}
                      onChange={(event) =>
                        updateField("addressLine1", event.target.value)
                      }
                      maxLength={200}
                      autoComplete="off"
                      required
                      {...errorAttributes(errors, "addressLine1")}
                    />
                    <FieldError field="addressLine1" errors={errors} />
                  </div>

                  <div className={`${styles.field} ${styles.full}`}>
                    <label
                      className={styles.label}
                      htmlFor="field-addressLine2"
                    >
                      Address line 2
                    </label>
                    <input
                      id="field-addressLine2"
                      className={styles.input}
                      value={form.addressLine2}
                      onChange={(event) =>
                        updateField("addressLine2", event.target.value)
                      }
                      maxLength={200}
                      autoComplete="off"
                      {...errorAttributes(errors, "addressLine2")}
                    />
                    <FieldError field="addressLine2" errors={errors} />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="field-city">
                      City or town <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="field-city"
                      className={styles.input}
                      value={form.city}
                      onChange={(event) =>
                        updateField("city", event.target.value)
                      }
                      maxLength={100}
                      autoComplete="off"
                      required
                      {...errorAttributes(errors, "city")}
                    />
                    <FieldError field="city" errors={errors} />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="field-state">
                      State or FCT <span className={styles.required}>*</span>
                    </label>
                    <select
                      id="field-state"
                      className={styles.select}
                      value={form.state}
                      onChange={(event) =>
                        updateField("state", event.target.value)
                      }
                      required
                      {...errorAttributes(errors, "state")}
                    >
                      <option value="">Select state or FCT</option>
                      {NIGERIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    <FieldError field="state" errors={errors} />
                  </div>

                  <div className={styles.field}>
                    <label
                      className={styles.label}
                      htmlFor="field-postalCode"
                    >
                      Postal code
                    </label>
                    <input
                      id="field-postalCode"
                      className={styles.input}
                      inputMode="numeric"
                      value={form.postalCode}
                      onChange={(event) =>
                        updateField("postalCode", event.target.value)
                      }
                      maxLength={10}
                      autoComplete="off"
                      {...errorAttributes(errors, "postalCode")}
                    />
                    <FieldError field="postalCode" errors={errors} />
                  </div>

                  <div className={styles.field}>
                    <span className={styles.label}>Country</span>
                    <p className={styles.detailValue}>Nigeria</p>
                  </div>
                </div>
              </fieldset>

              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Next of kin</legend>
                <div className={styles.fieldGrid}>
                  <div className={styles.field}>
                    <label
                      className={styles.label}
                      htmlFor="field-nextOfKinName"
                    >
                      Full name <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="field-nextOfKinName"
                      className={styles.input}
                      value={form.nextOfKinName}
                      onChange={(event) =>
                        updateField("nextOfKinName", event.target.value)
                      }
                      maxLength={100}
                      autoComplete="off"
                      required
                      {...errorAttributes(errors, "nextOfKinName")}
                    />
                    <FieldError field="nextOfKinName" errors={errors} />
                  </div>

                  <div className={styles.field}>
                    <label
                      className={styles.label}
                      htmlFor="field-nextOfKinRelationship"
                    >
                      Relationship{" "}
                      <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="field-nextOfKinRelationship"
                      className={styles.input}
                      value={form.nextOfKinRelationship}
                      onChange={(event) =>
                        updateField(
                          "nextOfKinRelationship",
                          event.target.value,
                        )
                      }
                      maxLength={80}
                      autoComplete="off"
                      required
                      {...errorAttributes(errors, "nextOfKinRelationship")}
                    />
                    <FieldError
                      field="nextOfKinRelationship"
                      errors={errors}
                    />
                  </div>

                  <div className={styles.field}>
                    <label
                      className={styles.label}
                      htmlFor="field-nextOfKinPhone"
                    >
                      Phone <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="field-nextOfKinPhone"
                      className={styles.input}
                      type="tel"
                      inputMode="tel"
                      value={form.nextOfKinPhone}
                      onChange={(event) =>
                        updateField("nextOfKinPhone", event.target.value)
                      }
                      maxLength={40}
                      autoComplete="off"
                      required
                      {...errorAttributes(errors, "nextOfKinPhone")}
                    />
                    <FieldError field="nextOfKinPhone" errors={errors} />
                  </div>
                </div>
              </fieldset>

              <div className={styles.actions}>
                <button
                  type="submit"
                  className={`${styles.button} ${styles.primary}`}
                  disabled={loading}
                >
                  {loading ? "Checking duplicates..." : "Review and register"}
                </button>
                <button
                  type="button"
                  className={`${styles.button} ${styles.secondary}`}
                  onClick={() => setPhase("search")}
                  disabled={loading}
                >
                  Back to search
                </button>
              </div>
            </form>
          </div>
        </section>
      ) : null}

      {phase === "duplicate" ? (
        <section className={styles.panel} aria-labelledby="duplicate-heading">
          <div className={styles.panelHeader}>
            <h2
              id="duplicate-heading"
              className={styles.panelTitle}
              ref={duplicateHeading}
              tabIndex={-1}
            >
              3. Review possible duplicates
            </h2>
            <p className={styles.panelDescription}>
              The server found existing synthetic records with matching
              identity information. Review each candidate. Records are never
              merged automatically.
            </p>
          </div>

          <div className={styles.panelBody}>
            <div className={styles.candidateGrid}>
              {candidates.map((candidate) => (
                <article
                  key={candidate.patient.id}
                  className={styles.candidateCard}
                >
                  <div className={styles.candidateHeader}>
                    <p className={styles.candidateName}>
                      {candidate.patient.familyName},{" "}
                      {candidate.patient.givenName}
                    </p>
                    <StatusBadge
                      label={
                        candidate.strength === "strong"
                          ? "Strong match"
                          : "Possible match"
                      }
                      tone={
                        candidate.strength === "strong"
                          ? "critical"
                          : "warning"
                      }
                    />
                  </div>
                  <div className={styles.candidateMeta}>
                    <span className={styles.mono}>
                      {candidate.patient.hospitalId}
                    </span>
                    <span>{sexLabel(candidate.patient.sex)}</span>
                    <span>{candidate.patient.dateOfBirthDisplay}</span>
                    <span className={styles.mono}>
                      {candidate.patient.primaryPhone}
                    </span>
                    <IdentityStatusBadge
                      status={candidate.patient.identityStatus}
                    />
                  </div>
                  <div className={styles.reasonList}>
                    {candidate.reasons.map((reason) => (
                      <span key={reason} className={styles.reason}>
                        {reason}
                      </span>
                    ))}
                  </div>
                  <div className={styles.candidateHeader}>
                    <span className={styles.score}>
                      Match score {candidate.score}
                    </span>
                    <Link
                      className={styles.linkButton}
                      href={`/patients/${candidate.patient.id}`}
                    >
                      Use this patient
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.stack}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="overrideReason">
                  {hasStrongCandidate
                    ? "Explain why this is a different patient (required)"
                    : "Review note (optional)"}
                </label>
                <textarea
                  id="overrideReason"
                  className={styles.textarea}
                  value={overrideReason}
                  onChange={(event) => setOverrideReason(event.target.value)}
                  maxLength={500}
                  placeholder="Record the reason for continuing as a new patient."
                />
                <p className={styles.hint}>
                  A recorded reason is required when a strong candidate is
                  deliberately bypassed.
                </p>
                {overrideError ? (
                  <p className={styles.error} role="alert">
                    {overrideError}
                  </p>
                ) : null}
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={`${styles.button} ${styles.primary}`}
                  onClick={handleDuplicateConfirm}
                  disabled={loading}
                >
                  {loading
                    ? "Checking duplicates..."
                    : "None of these — register as a new patient"}
                </button>
                <button
                  type="button"
                  className={`${styles.button} ${styles.secondary}`}
                  onClick={() => setPhase("form")}
                  disabled={loading}
                >
                  Back to details
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {phase === "registered" && registered ? (
        <section className={styles.panel} aria-labelledby="registered-heading">
          <div className={styles.panelHeader}>
            <h2
              id="registered-heading"
              className={styles.panelTitle}
              ref={successHeading}
              tabIndex={-1}
            >
              Synthetic patient registered
            </h2>
            <p className={styles.panelDescription}>
              The record exists in server memory only and will be lost when the
              application restarts.
            </p>
          </div>
          <div className={styles.panelBody}>
            <div className={styles.success}>
              <div>
                <p className={styles.successTitle}>
                  {registered.familyName}, {registered.givenName}
                </p>
                <p className={styles.successId}>{registered.hospitalId}</p>
              </div>
              <p>
                This hospital ID is unique within the current preview process.
                It is not a production identifier.
              </p>
              <div className={styles.bannerFlags}>
                <IdentityStatusBadge status={registered.identityStatus} />
              </div>
              <div className={styles.successActions}>
                <Link
                  className={`${styles.button} ${styles.primary}`}
                  href={`/patients/${registered.id}`}
                >
                  Open patient record
                </Link>
                <button
                  type="button"
                  className={`${styles.button} ${styles.secondary}`}
                  onClick={resetFlow}
                >
                  Register another patient
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
