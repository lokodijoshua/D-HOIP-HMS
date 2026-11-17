export type WorkspaceContext = {
  title: string;
  breadcrumb: string;
};

export const defaultWorkspaceContext: WorkspaceContext = {
  title: "Workspace",
  breadcrumb: "Foundation preview",
};

export const workspaceContextByPath: Record<string, WorkspaceContext> = {
  "/": {
    title: "Hospital overview",
    breadcrumb: "Operations / Overview",
  },
};

export function getWorkspaceContext(pathname: string): WorkspaceContext {
  const normalized =
    pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  return workspaceContextByPath[normalized] ?? defaultWorkspaceContext;
}
