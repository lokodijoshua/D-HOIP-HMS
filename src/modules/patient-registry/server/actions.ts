"use server";

import type {
  RegisterPatientActionResult,
  RegisterPatientOptions,
  SearchPatientsActionResult,
} from "../domain/types";
import { parseSearchPatientsInput } from "../domain/validation";
import { assertPatientPreviewEnabled } from "./preview-guard";
import { getPatientRegistryService } from "./service";

function parseRegisterOptions(value: unknown): RegisterPatientOptions {
  const record =
    value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  const overrideReason =
    typeof record.overrideReason === "string"
      ? record.overrideReason.trim().slice(0, 500)
      : "";
  const submissionKey =
    typeof record.submissionKey === "string"
      ? record.submissionKey.trim().slice(0, 100)
      : "";
  const assertedHospitalId =
    typeof record.assertedHospitalId === "string"
      ? record.assertedHospitalId.trim().slice(0, 20)
      : "";

  return {
    duplicateReviewAcknowledged: record.duplicateReviewAcknowledged === true,
    overrideReason,
    submissionKey,
    assertedHospitalId,
  };
}

export async function searchPatientsAction(
  input: unknown,
): Promise<SearchPatientsActionResult> {
  assertPatientPreviewEnabled();

  const parsed = parseSearchPatientsInput(input);
  if (!parsed.ok) {
    return { status: "invalid", errors: parsed.errors };
  }

  return { status: "ok", ...getPatientRegistryService().search(parsed.value) };
}

export async function registerPatientAction(
  input: unknown,
  options: unknown,
): Promise<RegisterPatientActionResult> {
  assertPatientPreviewEnabled();

  const result = getPatientRegistryService().register(
    input,
    parseRegisterOptions(options),
  );

  if (result.status === "registered") {
    return {
      status: "registered",
      patient: {
        id: result.patient.id,
        hospitalId: result.patient.hospitalId,
        familyName: result.patient.identity.familyName,
        givenName: result.patient.identity.givenName,
        identityStatus: result.patient.identityStatus,
      },
    };
  }

  return result;
}
