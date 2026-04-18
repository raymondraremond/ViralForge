import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Initialize postgres client
const client = postgres(process.env.DATABASE_URL!);

// Initialize Drizzle
export const db = drizzle(client, { schema });
