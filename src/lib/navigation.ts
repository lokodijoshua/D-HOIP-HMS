export type NavigationItem = {
  label: string;
  href?: string;
};

export type NavigationGroup = {
  label: string;
  planned?: boolean;
  items: NavigationItem[];
};

// Groups describe workspaces and shared capabilities, not the department registry.
export const navigationGroups: NavigationGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/" }],
  },
  {
    label: "Patient & clinical",
    planned: true,
    items: [
      { label: "Patient directory" },
      { label: "Encounters" },
      { label: "Consultation" },
      { label: "Nursing" },
      { label: "Emergency" },
      { label: "Ward" },
    ],
  },
  {
    label: "Diagnostics & pharmacy",
    planned: true,
    items: [
      { label: "Laboratory" },
      { label: "Radiology" },
      { label: "Pharmacy" },
      { label: "Inventory" },
    ],
  },
  {
    label: "Revenue & claims",
    planned: true,
    items: [{ label: "Billing" }, { label: "Claims & HMO" }],
  },
  {
    label: "Specialist services",
    planned: true,
    items: [
      { label: "Theatre" },
      { label: "Maternity" },
      { label: "Ophthalmology" },
    ],
  },
  {
    label: "Administration",
    planned: true,
    items: [{ label: "Department configuration" }],
  },
];
