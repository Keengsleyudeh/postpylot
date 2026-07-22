import "server-only";

import PgBoss from "pg-boss";
import { JOB } from "@postpylot/shared";

// pg-boss producer for the web app. The worker (apps/worker) is the consumer.
// Both connect to the same Postgres via the session-mode DIRECT_URL (pgbouncer
// transaction mode does not support pg-boss). A singleton keeps connection use
// low on repeated server-action invocations.
const globalForBoss = globalThis as unknown as {
  __postpylotBoss?: Promise<PgBoss>;
};

// Recent pg-connection-string versions treat `sslmode=require` as `verify-full`, which
// rejects the Supabase pooler certificate. Keep TLS on but skip CA verification and strip
// the sslmode param so it does not re-impose verification.
function getBossConfig(): {
  connectionString: string;
  ssl: { rejectUnauthorized: false };
} {
  const raw = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DIRECT_URL (or DATABASE_URL) must be set to enqueue jobs.");
  }
  let connectionString = raw;
  try {
    const parsed = new URL(raw);
    parsed.searchParams.delete("sslmode");
    connectionString = parsed.toString();
  } catch {
    // Leave the raw string untouched if it is not a parseable URL.
  }
  return { connectionString, ssl: { rejectUnauthorized: false } };
}

async function getBoss(): Promise<PgBoss> {
  if (!globalForBoss.__postpylotBoss) {
    const boss = new PgBoss({ ...getBossConfig(), max: 2 });
    globalForBoss.__postpylotBoss = boss.start().then(async () => {
      await boss.createQueue(JOB.publishPost).catch(() => {});
      await boss.createQueue(JOB.runAutomationRule).catch(() => {});
      return boss;
    });
  }
  return globalForBoss.__postpylotBoss;
}

export async function enqueuePublishPost(
  scheduleId: string,
  startAfter?: Date
): Promise<void> {
  const boss = await getBoss();
  await boss.send(
    JOB.publishPost,
    { scheduleId },
    startAfter ? { startAfter } : {}
  );
}

export async function enqueueRunAutomationRule(ruleId: string): Promise<void> {
  const boss = await getBoss();
  await boss.send(JOB.runAutomationRule, { ruleId });
}
