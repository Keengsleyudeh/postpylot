import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import type { ZodType } from "zod";

// LLM client with Gemini as the primary provider and OpenAI as the fallback
// (per postpylot-core.mdc). Providers are attempted in order; the first one
// with an API key configured is used, falling through on failure.

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
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
let openaiClient: OpenAI | null = null;

function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  geminiClient ??= new GoogleGenAI({ apiKey });
  return geminiClient;
}

function getOpenAI(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  openaiClient ??= new OpenAI({ apiKey });
  return openaiClient;
}

export function hasLlmProvider(): boolean {
  return Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
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
 */
export async function generateJson<T>(
  schema: ZodType<T>,
  system: string,
  user: string
): Promise<T> {
  if (!hasLlmProvider()) {
    throw new NoLlmProviderError();
  }

  const providers: Array<() => Promise<string | null>> = [
    () => generateWithGemini(system, user),
    () => generateWithOpenAI(system, user),
  ];

  let lastError: unknown = null;

  for (const provider of providers) {
    try {
      const raw = await provider();
      if (!raw) continue; // provider not configured
      const parsed = schema.parse(extractJson(raw));
      return parsed;
    } catch (error) {
      lastError = error;
    }
  }

  throw new LlmGenerationError(
    lastError instanceof Error
      ? `LLM generation failed: ${lastError.message}`
      : "LLM generation failed."
  );
}
