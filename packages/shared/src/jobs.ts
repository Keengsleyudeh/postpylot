import type { Platform } from "./platform";

// pg-boss queue names. Shared so the web app (producer) and worker (consumer)
// never drift. Payload types are declared here as the single source of truth.
export const JOB = {
  publishPost: "publish-post",
  runAutomationRule: "run-automation-rule",
  renderVideo: "render-video",
  publishVideo: "publish-video",
} as const;

export type JobName = (typeof JOB)[keyof typeof JOB];

export type PublishPostJob = {
  scheduleId: string;
};

export type RunAutomationRuleJob = {
  ruleId: string;
};

// Render a Video project (script → voice → Remotion) in the worker.
export type RenderVideoJob = {
  videoId: string;
};

// Publish a rendered Video to its platform on its scheduled slot.
export type PublishVideoJob = {
  scheduleId: string;
};

export type JobPayloads = {
  [JOB.publishPost]: PublishPostJob;
  [JOB.runAutomationRule]: RunAutomationRuleJob;
  [JOB.renderVideo]: RenderVideoJob;
  [JOB.publishVideo]: PublishVideoJob;
};

// Platforms whose text/image publish jobs the worker can complete today.
export const PUBLISHABLE_PLATFORMS: readonly Platform[] = ["linkedin", "facebook"];

// Platforms whose rendered-video publish jobs the worker can complete today.
export const VIDEO_PUBLISHABLE_PLATFORMS: readonly Platform[] = ["youtube"];
