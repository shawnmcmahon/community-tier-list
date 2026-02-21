import { jwtVerify } from "jose";

const encoder = new TextEncoder();

export type HostJwtPayload = {
  twitchUserId: string;
  sessionSlug: string;
  role: "HOST";
};

function getHostJwtSecret(): Uint8Array {
  const secret = process.env.HOST_JWT_SECRET;
  if (!secret) {
    throw new Error("HOST_JWT_SECRET is required");
  }
  return encoder.encode(secret);
}

export async function verifyHostJwt(token: string): Promise<HostJwtPayload> {
  const result = await jwtVerify(token, getHostJwtSecret(), {
    algorithms: ["HS256"],
  });

  const payload = result.payload as Partial<HostJwtPayload>;
  if (
    payload.role !== "HOST" ||
    typeof payload.twitchUserId !== "string" ||
    typeof payload.sessionSlug !== "string"
  ) {
    throw new Error("Invalid host token payload");
  }

  return {
    role: "HOST",
    twitchUserId: payload.twitchUserId,
    sessionSlug: payload.sessionSlug,
  };
}
