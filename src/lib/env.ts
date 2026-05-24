import { z } from "zod";

const EnvSchema = z.object({
  MONGODB_URI: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().min(1).optional(),
});

let cachedEnv: z.infer<typeof EnvSchema> | null = null;

export function getEnv() {
  if (cachedEnv) return cachedEnv;
  cachedEnv = EnvSchema.parse({
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  });
  return cachedEnv;
}

