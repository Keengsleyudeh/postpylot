import { prisma } from "@postpylot/db";
import type { Prisma } from "@postpylot/db";

// Wraps an agent run, persisting a structured AgentLog row for debugging and
// auditing (per postpylot-data.mdc). Never throws from logging itself.
export async function withAgentLog<T>(
  params: {
    agent: string;
    brandId?: string | null;
    input: Prisma.InputJsonValue;
  },
  run: () => Promise<T>
): Promise<T> {
  const startedAt = Date.now();
  try {
    const result = await run();
    await safeLog({
      agent: params.agent,
      brandId: params.brandId ?? null,
      status: "success",
      input: params.input,
      output: result as unknown as Prisma.InputJsonValue,
      durationMs: Date.now() - startedAt,
    });
    return result;
  } catch (error) {
    await safeLog({
      agent: params.agent,
      brandId: params.brandId ?? null,
      status: "error",
      input: params.input,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startedAt,
    });
    throw error;
  }
}

async function safeLog(data: {
  agent: string;
  brandId: string | null;
  status: string;
  input: Prisma.InputJsonValue;
  output?: Prisma.InputJsonValue;
  error?: string;
  durationMs: number;
}): Promise<void> {
  try {
    await prisma.agentLog.create({
      data: {
        agent: data.agent,
        brandId: data.brandId,
        status: data.status,
        input: data.input,
        output: data.output,
        error: data.error,
        durationMs: data.durationMs,
      },
    });
  } catch {
    // Logging must never break generation.
  }
}
