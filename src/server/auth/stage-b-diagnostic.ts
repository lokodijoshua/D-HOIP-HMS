export type StageBDiagnosticPhase =
  | "route_handler_entered"
  | "run_as_active_employee_entered"
  | "clerk_subject_verified"
  | "database_transaction_callback_entered"
  | "active_employee_link_verified"
  | "probe_resource_query_completed";

type DiagnosticPhase = StageBDiagnosticPhase | "not_entered";

type DiagnosticRecord = {
  phase: DiagnosticPhase;
  exception_name?: string;
  exception_class?: string;
  postgres_code?: string | null;
  clerk_code?: string | null;
};

export type StageBDiagnosticSink = {
  phase: (phase: StageBDiagnosticPhase) => void;
  classify: (error: unknown) => void;
};

const SAFE_NAME = /^[A-Za-z][A-Za-z0-9_.-]{0,79}$/;
const POSTGRES_CODE = /^[0-9A-Z]{5}$/;
const CLERK_CODE = /^[a-z0-9][a-z0-9_:-]{0,99}$/i;

function safeLabel(value: unknown): string | null {
  return typeof value === "string" && SAFE_NAME.test(value) ? value : null;
}

function getErrorRecord(error: unknown): Record<string, unknown> | null {
  return error !== null && typeof error === "object"
    ? (error as Record<string, unknown>)
    : null;
}

export function createStageBDiagnosticSink(): StageBDiagnosticSink {
  const enabled = process.env.NODE_ENV === "development";
  let phase: DiagnosticPhase = "not_entered";

  const emit = (record: DiagnosticRecord) => {
    if (enabled) {
      console.info("[stage-b-diag]", JSON.stringify(record));
    }
  };

  return {
    phase(nextPhase) {
      phase = nextPhase;
      emit({ phase });
    },
    classify(error) {
      if (!enabled) return;

      const record = getErrorRecord(error);
      const constructorValue = record?.constructor;
      const exceptionName = safeLabel(record?.name) ?? "Unknown";
      const exceptionClass =
        typeof constructorValue === "function" &&
        typeof constructorValue.name === "string" &&
        SAFE_NAME.test(constructorValue.name)
          ? constructorValue.name
          : "Unknown";

      const directCode =
        typeof record?.code === "string" ? record.code : null;
      const postgresCode =
        directCode && POSTGRES_CODE.test(directCode) ? directCode : null;

      const nestedErrors = Array.isArray(record?.errors)
        ? record.errors
        : [];
      const firstNested = nestedErrors[0];
      const nestedCode =
        firstNested &&
        typeof firstNested === "object" &&
        typeof (firstNested as Record<string, unknown>).code === "string"
          ? String((firstNested as Record<string, unknown>).code)
          : null;
      const clerkCode =
        nestedCode && CLERK_CODE.test(nestedCode) ? nestedCode : null;

      emit({
        phase,
        exception_name: exceptionName,
        exception_class: exceptionClass,
        postgres_code: postgresCode,
        clerk_code: clerkCode,
      });
    },
  };
}
