import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0A",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            background: "linear-gradient(135deg, #C8FF00 0%, #E8FF66 100%)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          P
        </div>
      </div>
    ),
    { ...size }
  );
}
