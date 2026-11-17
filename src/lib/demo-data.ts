export type MetricTone = "teal" | "slate" | "amber" | "crimson";

export type DemoStatusTone =
  | "positive"
  | "warning"
  | "critical"
  | "neutral"
  | "planned";

export type SummaryMetric = {
  label: string;
  value: string;
  detail: string;
  tone: MetricTone;
};

export type OperationalRow = {
  reference: string;
  area: string;
  status: string;
  tone: DemoStatusTone;
  updated: string;
};

export type CoverageArea = {
  name: string;
  description: string;
};

export type ReadinessItem = {
  label: string;
  status: string;
  tone: DemoStatusTone;
};

export const summaryMetrics: SummaryMetric[] = [
  {
    label: "Active encounters",
    value: "128",
    detail: "Synthetic operational snapshot",
    tone: "teal",
  },
  {
    label: "Open requests",
    value: "34",
    detail: "Across planned service areas",
    tone: "slate",
  },
  {
    label: "Payments recorded",
    value: "18",
    detail: "Synthetic records today",
    tone: "amber",
  },
  {
    label: "Claims outstanding",
    value: "7",
    detail: "Illustrative receivables",
    tone: "crimson",
  },
];

export const operationalRows: OperationalRow[] = [
  {
    reference: "DEMO-1042",
    area: "Outpatient services",
    status: "Active",
    tone: "positive",
    updated: "09:42",
  },
  {
    reference: "DEMO-1039",
    area: "Diagnostics",
    status: "Pending",
    tone: "warning",
    updated: "09:18",
  },
  {
    reference: "DEMO-1034",
    area: "Pharmacy",
    status: "In review",
    tone: "neutral",
    updated: "08:56",
  },
  {
    reference: "DEMO-1028",
    area: "Inpatient ward",
    status: "Active",
    tone: "positive",
    updated: "08:31",
  },
  {
    reference: "DEMO-1021",
    area: "Claims & HMO",
    status: "Awaiting response",
    tone: "critical",
    updated: "08:05",
  },
];

export const coverageAreas: CoverageArea[] = [
  {
    name: "Patient services",
    description: "Registration and encounter coordination.",
  },
  {
    name: "Clinical care",
    description: "Consultation and clinical request workspaces.",
  },
  {
    name: "Nursing & ward",
    description: "Inpatient and nursing operations.",
  },
  {
    name: "Diagnostics",
    description: "Laboratory and radiology requests and results.",
  },
  {
    name: "Pharmacy & inventory",
    description: "Dispensing, stock, and controlled medicines.",
  },
  {
    name: "Revenue & claims",
    description: "Billing, payments, and HMO claims.",
  },
];

export const readinessItems: ReadinessItem[] = [
  {
    label: "Application shell",
    status: "Implemented",
    tone: "positive",
  },
  {
    label: "UI tokens and components",
    status: "Provisional",
    tone: "warning",
  },
  {
    label: "Authentication",
    status: "Not configured",
    tone: "warning",
  },
  {
    label: "Database",
    status: "Not connected",
    tone: "neutral",
  },
];
