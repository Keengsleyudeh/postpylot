import type { Platform } from "./platform";

// pg-boss queue names. Shared so the web app (producer) and worker (consumer)
// never drift. Payload types are declared here as the single source of truth.
export const JOB = {
  publishPost: "publish-post",
  runAutomationRule: "run-automation-rule",
} as const;

export type JobName = (typeof JOB)[keyof typeof JOB];

export type PublishPostJob = {
  scheduleId: string;
};

export type RunAutomationRuleJob = {
  ruleId: string;
};

export type JobPayloads = {
  [JOB.publishPost]: PublishPostJob;
  [JOB.runAutomationRule]: RunAutomationRuleJob;
};

// Platforms whose publish jobs the worker can complete today. Others are logged
// as unsupported so the pipeline never fakes a success.
export const PUBLISHABLE_PLATFORMS: readonly Platform[] = ["linkedin", "facebook"];
