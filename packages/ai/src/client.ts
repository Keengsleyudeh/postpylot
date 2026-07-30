import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import type { ZodType } from "zod";

// LLM client with Gemini as the primary provider and OpenAI as the fallback
// (per postpylot-core.mdc). Providers are attempted in order; the first one
// with an API key configured is used, falling through on failure.
// Default model: gemini-3.1-flash-lite — free-tier friendly for new API keys.
// gemini-2.0-flash is shut down; gemini-2.5-flash is blocked for new users.

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite";
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export class NoLlmProviderError extends Error {
  constructor() {
    super(
      "No LLM provider configured. Set GEMINI_API_KEY or OPENAI_API_KEY."
    );
    this.name = "NoLlmProviderError";
  }
}

export class LlmGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LlmGenerationError";
  }
}

let geminiClient: GoogleGenAI | null = null;
let geminiKeyUsed: string | null = null;
let openaiClient: OpenAI | null = null;
let openaiKeyUsed: string | null = null;

function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  // Recreate if the env key changed (e.g. .env.local edited without a full restart).
  if (!geminiClient || geminiKeyUsed !== apiKey) {
    geminiClient = new GoogleGenAI({ apiKey });
    geminiKeyUsed = apiKey;
  }
  return geminiClient;
}

function getOpenAI(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  if (!openaiClient || openaiKeyUsed !== apiKey) {
    openaiClient = new OpenAI({ apiKey });
    openaiKeyUsed = apiKey;
  }
  return openaiClient;
}

export function hasLlmProvider(): boolean {
  return Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** True when the failure is clearly an OpenAI (or similar) billing/quota block. */
function isQuotaOrBillingError(error: unknown): boolean {
  const msg = errorMessage(error).toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("exceeded your current quota") ||
    msg.includes("insufficient_quota") ||
    msg.includes("billing details")
  );
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  // Strip markdown code fences if the model wrapped the JSON.
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced ? fenced[1] : trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    // Last resort: grab the outermost JSON object.
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    throw new LlmGenerationError("Model did not return valid JSON.");
  }
}

async function generateWithGemini(
  system: string,
  user: string
): Promise<string | null> {
  const client = getGemini();
  if (!client) return null;

  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: user,
    config: {
      systemInstruction: system,
      responseMimeType: "application/json",
      temperature: 0.8,
    },
  });

  return response.text ?? null;
}

async function generateWithOpenAI(
  system: string,
  user: string
): Promise<string | null> {
  const client = getOpenAI();
  if (!client) return null;

  const response = await client.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  return response.choices[0]?.message?.content ?? null;
}

/**
 * Generate a structured JSON value validated against a Zod schema. Tries Gemini
 * first, then OpenAI. Throws `NoLlmProviderError` when nothing is configured.
 * On total failure, surfaces every provider’s error so a dead Gemini model is
 * never hidden behind an OpenAI 429.
 */
export async function generateJson<T>(
  schema: ZodType<T>,
  system: string,
  user: string
): Promise<T> {
  if (!hasLlmProvider()) {
    throw new NoLlmProviderError();
  }

  const failures: string[] = [];
  let geminiFailed = false;

  // 1. Gemini (primary)
  if (process.env.GEMINI_API_KEY) {
    try {
      const raw = await generateWithGemini(system, user);
      if (raw) {
        return schema.parse(extractJson(raw));
      }
      failures.push("Gemini: empty response");
      geminiFailed = true;
    } catch (error) {
      failures.push(`Gemini: ${errorMessage(error)}`);
      geminiFailed = true;
    }
  }

  // 2. OpenAI (fallback) — still attempt unless not configured.
  if (process.env.OPENAI_API_KEY) {
    try {
      const raw = await generateWithOpenAI(system, user);
      if (raw) {
        return schema.parse(extractJson(raw));
      }
      failures.push("OpenAI: empty response");
    } catch (error) {
      // If OpenAI is just out of quota and Gemini already failed, keep Gemini’s
      // message first so billing noise does not hide the real primary failure.
      if (geminiFailed && isQuotaOrBillingError(error)) {
        failures.push(
          `OpenAI: skipped (quota/billing — ${errorMessage(error)})`
        );
      } else {
        failures.push(`OpenAI: ${errorMessage(error)}`);
      }
    }
  }

  throw new LlmGenerationError(
    failures.length
      ? `LLM generation failed: ${failures.join("; ")}`
      : "LLM generation failed."
  );
}
