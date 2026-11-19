import { StatusBadge } from "@/components/dashboard/StatusBadge";
import type { IdentityVerificationStatus } from "@/modules/patient-registry/domain/types";

export function IdentityStatusBadge({
  status,
}: Readonly<{
  status: IdentityVerificationStatus;
}>) {
  return status === "verified" ? (
    <StatusBadge label="Verified" tone="positive" />
  ) : (
    <StatusBadge label="Pending verification" tone="warning" />
  );
}
