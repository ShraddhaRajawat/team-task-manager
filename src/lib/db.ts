import mongoose from "mongoose";

import { getEnv } from "@/lib/env";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.mongooseCache ?? { conn: null, promise: null };
globalThis.mongooseCache = cached;

export async function connectDb() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const env = getEnv();
    cached.promise = mongoose.connect(env.MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

