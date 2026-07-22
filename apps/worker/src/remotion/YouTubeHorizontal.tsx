import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// The single MVP YouTube composition: 16:9, OLED black + neon lime brand accent,
// kinetic on-screen captions driven by the generated script's scene timings.
// Narration audio is muxed in by the worker after render (headless Chrome audio
// is unreliable), so this composition is visuals-only.

export type RemotionScene = {
  onScreenText: string;
  durationSeconds: number;
};

export type YouTubeHorizontalProps = {
  brandName: string;
  title: string;
  accent: string;
  scenes: RemotionScene[];
  fps: number;
  totalDurationSeconds: number;
};

export const ytDefaultProps: YouTubeHorizontalProps = {
  brandName: "PostPylot",
  title: "Your AI content engine on autopilot",
  accent: "#C8FF00",
  scenes: [
    { onScreenText: "Your idea", durationSeconds: 3 },
    { onScreenText: "On autopilot", durationSeconds: 3 },
  ],
  fps: 30,
  totalDurationSeconds: 6,
};

function SceneCaption({ text, accent }: { text: string; accent: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 18 });
  const translateY = interpolate(enter, [0, 1], [40, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 120,
      }}
    >
      <div
        style={{
          opacity: enter,
          transform: `translateY(${translateY}px)`,
          fontSize: 120,
          fontWeight: 800,
          lineHeight: 1.05,
          textAlign: "center",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        {text}
      </div>
      <div
        style={{
          marginTop: 48,
          width: interpolate(enter, [0, 1], [0, 240]),
          height: 10,
          borderRadius: 999,
          backgroundColor: accent,
        }}
      />
    </AbsoluteFill>
  );
}

export function YouTubeHorizontal(props: YouTubeHorizontalProps) {
  const { fps } = useVideoConfig();
  const { brandName, title, accent, scenes } = props;

  let cursor = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0A0A" }}>
      {/* Persistent brand mark */}
      <AbsoluteFill style={{ padding: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: accent,
            }}
          />
          <div style={{ fontSize: 34, color: "#8A8A8A", fontFamily: "sans-serif" }}>
            {brandName}
          </div>
        </div>
      </AbsoluteFill>

      {scenes.map((scene, index) => {
        const durationInFrames = Math.max(1, Math.round(scene.durationSeconds * fps));
        const from = cursor;
        cursor += durationInFrames;
        return (
          <Sequence key={index} from={from} durationInFrames={durationInFrames}>
            <SceneCaption text={scene.onScreenText} accent={accent} />
          </Sequence>
        );
      })}

      {/* Outro fills any remaining time (e.g. when narration runs longer). */}
      <Sequence from={cursor}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: accent,
              textAlign: "center",
              fontFamily: "sans-serif",
              padding: 120,
            }}
          >
            {title}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
}
