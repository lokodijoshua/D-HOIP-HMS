import { auth } from "@clerk/nextjs/server";

export type ClerkAuthResult = {
  userId: string | null;
};

export type ClerkAuth = () => Promise<ClerkAuthResult>;

export type VerifiedClerkSubject = {
  sub: string;
};

export class UnauthenticatedError extends Error {
  constructor() {
    super("Authentication is required.");
    this.name = "UnauthenticatedError";
  }
}

export async function getVerifiedClerkSubject(
  authFn: ClerkAuth = () => auth(),
): Promise<VerifiedClerkSubject> {
  const result = await authFn();

  if (!result.userId) {
    throw new UnauthenticatedError();
  }

  return { sub: result.userId };
}
