import { getQueueConfig } from "./env";
import PgBoss from "pg-boss";
import {
  JOB,
  type PublishPostJob,
  type RunAutomationRuleJob,
} from "@postpylot/shared";

import { handlePublishPost } from "./jobs/publish-post";
import { handleRunAutomationRule } from "./jobs/run-automation-rule";

async function main(): Promise<void> {
  const boss = new PgBoss({
    ...getQueueConfig(),
    // Keep the local footprint small; this is a single always-on worker.
    max: 4,
  });

  boss.on("error", (error) => {
    console.error("[worker] pg-boss error:", error);
  });

  await boss.start();

  await boss.createQueue(JOB.publishPost);
  await boss.createQueue(JOB.runAutomationRule);

  await boss.work<PublishPostJob>(JOB.publishPost, async ([job]) => {
    await handlePublishPost(job.data.scheduleId);
  });

  await boss.work<RunAutomationRuleJob>(
    JOB.runAutomationRule,
    async ([job]) => {
      await handleRunAutomationRule(job.data.ruleId);
    }
  );

  console.log("[worker] PostPylot worker started. Listening for jobs...");

  const shutdown = async () => {
    console.log("[worker] shutting down...");
    await boss.stop({ graceful: true });
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error("[worker] fatal:", error);
  process.exit(1);
});
