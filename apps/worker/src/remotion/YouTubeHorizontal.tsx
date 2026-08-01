import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// The MVP YouTube composition: 16:9, OLED black + neon lime brand accent,
// role-based layouts (hook / point / cta) with kinetic captions.
// Narration audio is muxed in by the worker after render (headless Chrome audio
// is unreliable), so this composition is visuals-only.

export type RemotionSceneRole = "hook" | "point" | "cta";

export type RemotionScene = {
  onScreenText: string;
  durationSeconds: number;
  role: RemotionSceneRole;
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
    { onScreenText: "Your idea", durationSeconds: 3, role: "hook" },
    { onScreenText: "On autopilot", durationSeconds: 3, role: "point" },
    { onScreenText: "Start free", durationSeconds: 3, role: "cta" },
  ],
  fps: 30,
  totalDurationSeconds: 9,
};

function Atmosphere({ accent }: { accent: string }) {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0A0A" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 50% 40%, ${accent}22 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 80% 80%, ${accent}14 0%, transparent 50%),
            linear-gradient(180deg, #0A0A0A 0%, #121212 100%)
          `,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.12,
          backgroundImage: `
            linear-gradient(${accent}33 1px, transparent 1px),
            linear-gradient(90deg, ${accent}33 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
    </AbsoluteFill>
  );
}

function BrandChip({ brandName, accent }: { brandName: string; accent: string }) {
  return (
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
        <div
          style={{
            fontSize: 34,
            color: "#8A8A8A",
            fontFamily: "system-ui, sans-serif",
            fontWeight: 600,
          }}
        >
          {brandName}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function StaggeredWords({
  text,
  accent,
  fontSize,
  align = "center",
}: {
  text: string;
  accent: string;
  fontSize: number;
  align?: "center" | "left";
}) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const words = text.trim().split(/\s+/).filter(Boolean);

  const exitStart = Math.max(0, durationInFrames - 10);
  const exitOpacity = interpolate(frame, [exitStart, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        gap: "0.25em 0.35em",
        opacity: exitOpacity,
        maxWidth: "100%",
      }}
    >
      {words.map((word, i) => {
        const delay = i * 3;
        const enter = spring({
          frame: frame - delay,
          fps,
          config: { damping: 200 },
          durationInFrames: 16,
        });
        const y = interpolate(enter, [0, 1], [28, 0]);
        return (
          <span
            key={`${word}-${i}`}
            style={{
              display: "inline-block",
              opacity: enter,
              transform: `translateY(${y}px)`,
              fontSize,
              fontWeight: 800,
              lineHeight: 1.1,
              color: "#FFFFFF",
              fontFamily: "system-ui, sans-serif",
              textShadow: `0 0 40px ${accent}33`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}

function HookScene({ text, accent }: { text: string; accent: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bar = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 20 });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 120,
      }}
    >
      <StaggeredWords text={text} accent={accent} fontSize={96} />
      <div
        style={{
          marginTop: 40,
          width: interpolate(bar, [0, 1], [0, 280]),
          height: 10,
          borderRadius: 999,
          backgroundColor: accent,
        }}
      />
    </AbsoluteFill>
  );
}

function PointScene({
  text,
  accent,
  index,
}: {
  text: string;
  accent: string;
  index: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 180 }, durationInFrames: 18 });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        padding: "120px 140px",
        opacity: enter,
      }}
    >
      <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
        <div
          style={{
            width: 12,
            alignSelf: "stretch",
            minHeight: 160,
            borderRadius: 999,
            backgroundColor: accent,
            transform: `scaleY(${enter})`,
            transformOrigin: "top",
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: accent,
              fontFamily: "system-ui, sans-serif",
              marginBottom: 24,
              letterSpacing: "0.08em",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </div>
          <StaggeredWords text={text} accent={accent} fontSize={72} align="left" />
        </div>
      </div>
    </AbsoluteFill>
  );
}

function CtaScene({
  text,
  accent,
  title,
}: {
  text: string;
  accent: string;
  title: string;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 160 }, durationInFrames: 20 });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 100,
      }}
    >
      <div
        style={{
          opacity: enter,
          transform: `scale(${interpolate(enter, [0, 1], [0.92, 1])})`,
          width: "100%",
          maxWidth: 1400,
          borderRadius: 40,
          padding: "72px 80px",
          background: `linear-gradient(135deg, ${accent}22 0%, #1A1A1A 45%, #141414 100%)`,
          border: `2px solid ${accent}66`,
          boxShadow: `0 0 80px ${accent}22`,
          textAlign: "center",
        }}
      >
        <StaggeredWords text={text} accent={accent} fontSize={72} />
        <div
          style={{
            marginTop: 36,
            fontSize: 28,
            color: "#8A8A8A",
            fontFamily: "system-ui, sans-serif",
            fontWeight: 600,
          }}
        >
          {title}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function SceneLayout({
  scene,
  accent,
  title,
  index,
}: {
  scene: RemotionScene;
  accent: string;
  title: string;
  index: number;
}) {
  if (scene.role === "hook") {
    return <HookScene text={scene.onScreenText} accent={accent} />;
  }
  if (scene.role === "cta") {
    return <CtaScene text={scene.onScreenText} accent={accent} title={title} />;
  }
  return (
    <PointScene text={scene.onScreenText} accent={accent} index={index} />
  );
}

export function YouTubeHorizontal(props: YouTubeHorizontalProps) {
  const { fps } = useVideoConfig();
  const { brandName, title, accent, scenes } = props;

  let cursor = 0;

  return (
    <AbsoluteFill>
      <Atmosphere accent={accent} />
      <BrandChip brandName={brandName} accent={accent} />

      {scenes.map((scene, index) => {
        const durationInFrames = Math.max(
          1,
          Math.round(scene.durationSeconds * fps)
        );
        const from = cursor;
        cursor += durationInFrames;
        return (
          <Sequence key={index} from={from} durationInFrames={durationInFrames}>
            <SceneLayout
              scene={scene}
              accent={accent}
              title={title}
              index={index}
            />
          </Sequence>
        );
      })}

      {/* Outro fills any remaining time if totalDuration > scene sum. */}
      <Sequence from={cursor}>
        <AbsoluteFill
          style={{ justifyContent: "center", alignItems: "center", padding: 120 }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: accent,
              textAlign: "center",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {title}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
}
