export const PATIENT_PREVIEW_UNAVAILABLE_MESSAGE =
  "Patient preview is unavailable in production.";

export class PatientPreviewUnavailableError extends Error {
  constructor() {
    super(PATIENT_PREVIEW_UNAVAILABLE_MESSAGE);
    this.name = "PatientPreviewUnavailableError";
  }
}

export function isPatientPreviewEnabled(
  nodeEnv: string | undefined = process.env.NODE_ENV,
): boolean {
  return nodeEnv !== "production";
}

export function assertPatientPreviewEnabled(
  nodeEnv: string | undefined = process.env.NODE_ENV,
): void {
  if (!isPatientPreviewEnabled(nodeEnv)) {
    throw new PatientPreviewUnavailableError();
  }
}
