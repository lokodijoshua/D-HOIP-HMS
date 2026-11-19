export type WorkspaceContext = {
  title: string;
  breadcrumb: string;
  environment?: string;
};

export const defaultWorkspaceContext: WorkspaceContext = {
  title: "Workspace",
  breadcrumb: "Foundation preview",
  environment: "UI foundation",
};

export const workspaceContextByPath: Record<string, WorkspaceContext> = {
  "/": {
    title: "Hospital overview",
    breadcrumb: "Operations / Overview",
    environment: "UI foundation",
  },
  "/patients": {
    title: "Patient directory",
    breadcrumb: "Patient records / Registry",
    environment: "Registry preview",
  },
  "/patients/new": {
    title: "Register patient",
    breadcrumb: "Patient records / Registration",
    environment: "Registry preview",
  },
};

export function getWorkspaceContext(pathname: string): WorkspaceContext {
  const normalized =
    pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  const exact = workspaceContextByPath[normalized];
  if (exact) {
    return exact;
  }

  if (/^\/patients\/[^/]+$/.test(normalized)) {
    return {
      title: "Patient record",
      breadcrumb: "Patient records / Patient record",
      environment: "Registry preview",
    };
  }

  return defaultWorkspaceContext;
}
