import { spawn } from "node:child_process";
import { open } from "node:fs/promises";

// Piper TTS (MVP voice, self-hosted, free — ADR 002). We shell out to the Piper
// binary and abstract it behind `synthesize()` so Kokoro/ElevenLabs can be
// swapped in later without changing callers. Configure PIPER_BIN (executable)
// and PIPER_VOICE (.onnx model path) in the worker environment.

export class VoiceNotConfiguredError extends Error {
  constructor() {
    super(
      "Piper TTS is not configured. Set PIPER_BIN and PIPER_VOICE in the worker environment."
    );
    this.name = "VoiceNotConfiguredError";
  }
}

export function isVoiceConfigured(): boolean {
  return Boolean(process.env.PIPER_BIN && process.env.PIPER_VOICE);
}

// Synthesizes `text` to a WAV file at `outputPath` using Piper. Text is written
// to stdin; Piper writes a single WAV to the output path.
export async function synthesize(
  text: string,
  outputPath: string
): Promise<void> {
  const bin = process.env.PIPER_BIN;
  const voice = process.env.PIPER_VOICE;
  if (!bin || !voice) {
    throw new VoiceNotConfiguredError();
  }

  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      bin,
      ["--model", voice, "--output_file", outputPath],
      { stdio: ["pipe", "ignore", "pipe"] }
    );

    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Piper exited with code ${code}: ${stderr.trim()}`));
      }
    });

    child.stdin.write(text);
    child.stdin.end();
  });
}

// Reads the duration (seconds) of a PCM WAV file from its header. Parses the
// standard 44-byte RIFF/WAVE header (byteRate + data chunk size).
export async function getWavDurationSeconds(path: string): Promise<number> {
  const file = await open(path, "r");
  try {
    const header = Buffer.alloc(44);
    await file.read(header, 0, 44, 0);
    // Bytes 28-31: byte rate (bytes per second). Bytes 40-43: data chunk size.
    const byteRate = header.readUInt32LE(28);
    const dataSize = header.readUInt32LE(40);
    if (!byteRate) return 0;
    return dataSize / byteRate;
  } finally {
    await file.close();
  }
}
