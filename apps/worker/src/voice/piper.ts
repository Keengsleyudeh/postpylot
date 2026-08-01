import { spawn } from "node:child_process";
import { access, open, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import ffmpegPath from "ffmpeg-static";

// Piper TTS (MVP voice, self-hosted, free — ADR 002). We shell out to the Piper
// binary and abstract it behind `synthesize()` so Kokoro/ElevenLabs can be
// swapped in later without changing callers. Configure PIPER_BIN (executable)
// and PIPER_VOICE (.onnx model path) in the worker environment. The sibling
// `.onnx.json` config MUST sit next to the model or Piper aborts on Windows.

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

function voiceConfigPath(voiceOnnxPath: string): string {
  return `${voiceOnnxPath}.json`;
}

async function assertVoiceFiles(bin: string, voice: string): Promise<void> {
  try {
    await access(bin);
  } catch {
    throw new Error(`PIPER_BIN not found: ${bin}`);
  }
  try {
    await access(voice);
  } catch {
    throw new Error(`PIPER_VOICE not found: ${voice}`);
  }
  const config = voiceConfigPath(voice);
  try {
    await access(config);
  } catch {
    throw new Error(
      `Piper voice config missing: ${config}. Download the matching .onnx.json next to the model (e.g. from rhasspy/piper-voices on Hugging Face).`
    );
  }
}

// Synthesizes `text` to a WAV file at `outputPath` using Piper. Writes text to
// a sibling temp file first, then feeds it to stdin in one shot — more reliable
// on Windows than streaming a giant buffer into a crashing onnxruntime.
export async function synthesize(
  text: string,
  outputPath: string
): Promise<void> {
  const bin = process.env.PIPER_BIN;
  const voice = process.env.PIPER_VOICE;
  if (!bin || !voice) {
    throw new VoiceNotConfiguredError();
  }

  await assertVoiceFiles(bin, voice);

  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    throw new Error("Cannot synthesize empty narration.");
  }

  const inputPath = join(dirname(outputPath), `piper-in-${Date.now()}.txt`);
  await writeFile(inputPath, cleaned, "utf8");

  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      bin,
      ["--model", voice, "--output_file", outputPath],
      {
        // Piper resolves espeak-ng-data and DLLs relative to its install dir.
        cwd: dirname(bin),
        stdio: ["pipe", "ignore", "pipe"],
        windowsHide: true,
      }
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
        reject(
          new Error(
            `Piper exited with code ${code}: ${stderr.trim() || "(no stderr)"}`
          )
        );
      }
    });

    child.stdin.write(cleaned);
    child.stdin.end();
  });
}

// Concatenates multiple WAV files into one with ffmpeg-static (re-encodes to a
// consistent PCM WAV so mismatched Piper outputs still join cleanly).
export async function concatenateWavs(
  inputPaths: string[],
  outputPath: string
): Promise<void> {
  if (!ffmpegPath) {
    throw new Error("ffmpeg-static binary not found.");
  }
  if (inputPaths.length === 0) {
    throw new Error("No WAV files to concatenate.");
  }
  if (inputPaths.length === 1) {
    const { copyFile } = await import("node:fs/promises");
    await copyFile(inputPaths[0], outputPath);
    return;
  }

  const listPath = join(dirname(outputPath), `concat-${Date.now()}.txt`);
  const listBody = inputPaths
    .map((p) => `file '${p.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`)
    .join("\n");
  await writeFile(listPath, listBody, "utf8");

  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      ffmpegPath as string,
      [
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        listPath,
        "-c",
        "copy",
        outputPath,
      ],
      { windowsHide: true }
    );
    let stderr = "";
    child.stderr.on("data", (c) => (stderr += String(c)));
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0
        ? resolve()
        : reject(
            new Error(
              `ffmpeg concat failed (${code}): ${stderr.slice(-500)}`
            )
          )
    );
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
