import { createHospitalIdAllocator } from "../domain/hospital-id";
import type {
  IdentityVerificationStatus,
  PatientAuditEvent,
  PatientRecord,
  PatientRegistrationMetadata,
} from "../domain/types";

type SeedPatient = {
  familyName: string;
  givenName: string;
  middleName?: string;
  preferredName?: string;
  sex: PatientRecord["identity"]["sex"];
  dateOfBirth?: string;
  estimatedAge?: { value: number; unit: "years" | "months" | "days"; asOf: string };
  primaryPhone: string;
  secondaryPhone?: string;
  email?: string;
  address: PatientRecord["address"];
  nextOfKin: PatientRecord["nextOfKin"];
  identityStatus: IdentityVerificationStatus;
  registeredDaysAgo: number;
  duplicateReview?: PatientRegistrationMetadata["duplicateReview"];
};

const SEED_PATIENTS: SeedPatient[] = [
  {
    familyName: "Adeyemi",
    givenName: "John",
    middleName: "Tunde",
    sex: "male",
    dateOfBirth: "1978-01-01",
    primaryPhone: "+2348025678901",
    email: "john.adeyemi@example.test",
    address: {
      line1: "18 Bodija Road",
      line2: "",
      city: "Ibadan",
      state: "Oyo",
      postalCode: "200212",
      country: "Nigeria",
    },
    nextOfKin: {
      fullName: "Bola Adeyemi",
      relationship: "Spouse",
      phone: "+2348025678902",
    },
    identityStatus: "verified",
    registeredDaysAgo: 180,
  },
  {
    familyName: "Okafor",
    givenName: "Chinedu",
    sex: "male",
    dateOfBirth: "1985-11-02",
    primaryPhone: "+2348062345678",
    address: {
      line1: "7 Ogui Road",
      line2: "",
      city: "Enugu",
      state: "Enugu",
      postalCode: "400102",
      country: "Nigeria",
    },
    nextOfKin: {
      fullName: "Ngozi Okafor",
      relationship: "Sister",
      phone: "+2348062345679",
    },
    identityStatus: "pending",
    registeredDaysAgo: 120,
  },
  {
    familyName: "Okafor",
    givenName: "Mary",
    preferredName: "Maryam",
    sex: "female",
    dateOfBirth: "1992-03-18",
    primaryPhone: "+2348062345678",
    address: {
      line1: "7 Ogui Road",
      line2: "",
      city: "Enugu",
      state: "Enugu",
      postalCode: "400102",
      country: "Nigeria",
    },
    nextOfKin: {
      fullName: "Chinedu Okafor",
      relationship: "Brother",
      phone: "+2348062345678",
    },
    identityStatus: "verified",
    registeredDaysAgo: 90,
    duplicateReview: {
      candidateCount: 1,
      hasStrongCandidate: false,
      overrideReason: "",
    },
  },
  {
    familyName: "Bello",
    givenName: "Fatima",
    sex: "female",
    estimatedAge: { value: 34, unit: "years", asOf: "2026-01-15" },
    primaryPhone: "+2348073456789",
    address: {
      line1: "22 Zoo Road",
      line2: "",
      city: "Kano",
      state: "Kano",
      postalCode: "700213",
      country: "Nigeria",
    },
    nextOfKin: {
      fullName: "Musa Bello",
      relationship: "Father",
      phone: "+2348073456790",
    },
    identityStatus: "pending",
    registeredDaysAgo: 45,
  },
  {
    familyName: "Yusuf",
    givenName: "Amina",
    middleName: "Halima",
    sex: "female",
    dateOfBirth: "1990-05-12",
    primaryPhone: "+2348031234567",
    email: "amina.yusuf@example.test",
    address: {
      line1: "5 Allen Avenue",
      line2: "Ikeja",
      city: "Lagos",
      state: "Lagos",
      postalCode: "100281",
      country: "Nigeria",
    },
    nextOfKin: {
      fullName: "Ibrahim Yusuf",
      relationship: "Spouse",
      phone: "+2348031234568",
    },
    identityStatus: "verified",
    registeredDaysAgo: 30,
  },
  {
    familyName: "Yusuf",
    givenName: "Amina",
    sex: "female",
    dateOfBirth: "2001-08-09",
    primaryPhone: "+2348094567890",
    address: {
      line1: "12 Ademola Adetokunbo Crescent",
      line2: "",
      city: "Abuja",
      state: "Federal Capital Territory",
      postalCode: "900211",
      country: "Nigeria",
    },
    nextOfKin: {
      fullName: "Zainab Yusuf",
      relationship: "Mother",
      phone: "+2348094567891",
    },
    identityStatus: "pending",
    registeredDaysAgo: 10,
  },
];

function daysAgo(now: Date, days: number): Date {
  return new Date(now.getTime() - days * 86_400_000);
}

function auditEvent(
  at: string,
  action: string,
  detail: string,
): PatientAuditEvent {
  return {
    id: globalThis.crypto.randomUUID(),
    at,
    action,
    actor: "Synthetic Registrar",
    detail,
  };
}

function clonePatient(patient: PatientRecord): PatientRecord {
  return structuredClone(patient);
}

function cloneAuditEvent(event: PatientAuditEvent): PatientAuditEvent {
  return structuredClone(event);
}

type IdempotencyRecord = {
  patientId: string;
  payloadFingerprint: string;
};

export class InMemoryPatientRepository {
  private readonly patients = new Map<string, PatientRecord>();
  private readonly auditEvents = new Map<string, PatientAuditEvent[]>();
  private readonly idempotency = new Map<string, IdempotencyRecord>();
  private readonly allocator = createHospitalIdAllocator();

  constructor(options: { seed?: boolean; seedNow?: Date } = {}) {
    if (options.seed ?? true) {
      this.seed(options.seedNow ?? new Date());
    }
  }

  private seed(now: Date): void {
    for (const seed of SEED_PATIENTS) {
      const registeredAt = daysAgo(now, seed.registeredDaysAgo);
      const hospitalId = this.allocator.allocate(registeredAt);
      const identity = {
        familyName: seed.familyName,
        givenName: seed.givenName,
        middleName: seed.middleName ?? "",
        preferredName: seed.preferredName ?? "",
        nameStatus: "complete" as const,
        sex: seed.sex,
        dateOfBirth: seed.dateOfBirth ?? "",
        dobPrecision: seed.estimatedAge
          ? ("estimated" as const)
          : ("exact" as const),
        estimatedAge: seed.estimatedAge
          ? structuredClone(seed.estimatedAge)
          : null,
      };
      const patient: PatientRecord = {
        id: globalThis.crypto.randomUUID(),
        hospitalId,
        identity,
        contact: {
          primaryPhone: seed.primaryPhone,
          secondaryPhone: seed.secondaryPhone ?? "",
          email: seed.email ?? "",
        },
        address: structuredClone(seed.address),
        nextOfKin: structuredClone(seed.nextOfKin),
        identityStatus: seed.identityStatus,
        registration: {
          registeredAt: registeredAt.toISOString(),
          registeredBy: "Synthetic Registrar",
          source: "synthetic-preview",
          duplicateReview: seed.duplicateReview
            ? structuredClone(seed.duplicateReview)
            : null,
        },
      };

      this.save(patient);
      const events = [
        auditEvent(
          patient.registration.registeredAt,
          "patient.registered",
          "Patient registered in the synthetic preview.",
        ),
        auditEvent(
          patient.registration.registeredAt,
          "patient.hospital_id.allocated",
          `Hospital ID ${patient.hospitalId} allocated.`,
        ),
      ];

      if (seed.duplicateReview) {
        events.push(
          auditEvent(
            patient.registration.registeredAt,
            "duplicate.reviewed",
            `${seed.duplicateReview.candidateCount} candidate(s) reviewed before registration.`,
          ),
        );
      }

      this.auditEvents.set(patient.id, events);
    }
  }

  allPatients(): PatientRecord[] {
    return [...this.patients.values()].map(clonePatient);
  }

  allocateHospitalId(date: Date): string {
    return this.allocator.allocate(date);
  }

  findById(patientId: string): PatientRecord | undefined {
    const patient = this.patients.get(patientId);
    return patient ? clonePatient(patient) : undefined;
  }

  findByHospitalId(hospitalId: string): PatientRecord | undefined {
    return this.allPatients().find(
      (patient) => patient.hospitalId === hospitalId,
    );
  }

  save(patient: PatientRecord): void {
    this.patients.set(patient.id, clonePatient(patient));
  }

  appendAuditEvents(patientId: string, events: PatientAuditEvent[]): void {
    const existing = this.auditEvents.get(patientId) ?? [];
    this.auditEvents.set(patientId, [
      ...existing.map(cloneAuditEvent),
      ...events.map(cloneAuditEvent),
    ]);
  }

  getAuditEvents(patientId: string): PatientAuditEvent[] {
    return [...(this.auditEvents.get(patientId) ?? [])]
      .map(cloneAuditEvent)
      .sort((left, right) => left.at.localeCompare(right.at));
  }

  findIdempotentResult(
    submissionKey: string,
  ): IdempotencyRecord | undefined {
    const record = this.idempotency.get(submissionKey);
    return record ? { ...record } : undefined;
  }

  rememberIdempotentResult(
    submissionKey: string,
    patientId: string,
    payloadFingerprint: string,
  ): void {
    this.idempotency.set(submissionKey, {
      patientId,
      payloadFingerprint,
    });
  }
}

let repository: InMemoryPatientRepository | undefined;

export function getPatientRepository(): InMemoryPatientRepository {
  repository ??= new InMemoryPatientRepository();
  return repository;
}
