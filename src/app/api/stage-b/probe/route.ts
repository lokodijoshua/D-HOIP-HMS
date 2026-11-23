import { runAsActiveEmployee } from "@/server/auth/require-employee";
import { createStageBDiagnosticSink } from "@/server/auth/stage-b-diagnostic";
import { UnauthenticatedError } from "@/server/auth/clerk";
import { EmployeeAccessDeniedError } from "@/server/auth/employee";
import { stageBProbeResource } from "@/server/db/stage-b-schema";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new Response(null, { status: 404 });
  }

  const diagnostics =
    process.env.NODE_ENV === "development"
      ? createStageBDiagnosticSink()
      : undefined;

  diagnostics?.phase("route_handler_entered");

  try {
    const rows = await runAsActiveEmployee(
      async (tx) => {
        const result = await tx
          .select({
            id: stageBProbeResource.id,
            label: stageBProbeResource.label,
          })
          .from(stageBProbeResource);

        diagnostics?.phase("probe_resource_query_completed");
        return result;
      },
      diagnostics,
    );

    return Response.json({ rows });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return Response.json(
        { error: "Authentication is required." },
        { status: 401 },
      );
    }

    if (error instanceof EmployeeAccessDeniedError) {
      return Response.json({ error: "Access is denied." }, { status: 403 });
    }

    diagnostics?.classify(error);

    return Response.json(
      { error: "The security probe is unavailable." },
      { status: 503 },
    );
  }
}
