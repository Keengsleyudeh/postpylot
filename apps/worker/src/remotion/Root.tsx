import { Composition } from "remotion";

import {
  YouTubeHorizontal,
  ytDefaultProps,
  type YouTubeHorizontalProps,
} from "./YouTubeHorizontal";

export const COMPOSITION_ID = "YouTubeHorizontal";
const FPS = 30;

// Duration is dynamic: derived from the generated script + narration length,
// passed in via input props as `totalDurationSeconds`.
export function RemotionRoot() {
  return (
    <Composition
      id={COMPOSITION_ID}
      component={YouTubeHorizontal}
      durationInFrames={Math.round(ytDefaultProps.totalDurationSeconds * FPS)}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={ytDefaultProps}
      calculateMetadata={({ props }: { props: YouTubeHorizontalProps }) => {
        const fps = props.fps || FPS;
        const seconds = Math.max(props.totalDurationSeconds || 0, 3);
        return {
          durationInFrames: Math.max(1, Math.round(seconds * fps)),
          fps,
        };
      }}
    />
  );
}
