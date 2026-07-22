# ADR 002 — Voice (TTS) and captions ladder

Status: Accepted

## Context

The constitution draft listed Kokoro as primary TTS, Piper as fallback, ElevenLabs as
premium, and Whisper for captions. The codebase and rules currently reference only Piper.
We want the cheapest path that still ships good-enough voice, with a clear quality upgrade
path — all self-hosted where possible.

## Decision

Adopt a self-host-first TTS ladder and local captions:

1. **Piper (MVP default)** — fast, tiny, free, runs in the worker. Ships first.
2. **Kokoro (quality upgrade)** — swap in for higher-quality narration, still self-hosted
   at roughly $0. Introduced when voice quality becomes a differentiator.
3. **ElevenLabs (optional premium)** — paid, opt-in only. Never required for MVP.

Captions/subtitles use **local Whisper** (e.g. whisper.cpp) in the worker, added when the
video phase (Phase 8) lands.

## Rationale

- **Cost:** Piper and Kokoro are free to self-host; Whisper local avoids per-minute
  transcription fees. ElevenLabs is reserved for users who explicitly want premium voice.
- **Effectiveness:** Piper is good enough to ship; Kokoro raises quality without changing
  the cost model.

## Consequences

- The Voice agent must abstract the TTS provider behind one interface so Piper → Kokoro →
  ElevenLabs is a config/provider swap, not a rewrite.
- Worker hosts must have the TTS and Whisper binaries/models available.
