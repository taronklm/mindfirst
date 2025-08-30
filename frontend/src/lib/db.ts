import mongoose, { Connection } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) {
  throw new Error("Please set MONGODB_URI in .env.local");
}

type MongooseCache = {
  conn: Connection | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
   
  var _mongooseCache: MongooseCache | undefined;
}

const cache = global._mongooseCache ?? { conn: null, promise: null };

export async function dbConnect(): Promise<Connection> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB,
    });
  }

  const mongooseInstance = await cache.promise;
  cache.conn = mongooseInstance.connection;

  if (!global._mongooseCache) global._mongooseCache = cache;
  return cache.conn;
}
