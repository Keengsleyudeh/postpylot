import { prisma } from "@postpylot/db";

// Thin automation execution for the MVP: records that the rule ran and notifies
// the user. Wiring full generate + schedule + publish orchestration onto this
// job is the next step once the generation pipeline is battle-tested.
// TODO(phase-11): enqueue generate -> quality gate -> schedule -> publish.
export async function handleRunAutomationRule(ruleId: string): Promise<void> {
  const rule = await prisma.automationRule.findUnique({
    where: { id: ruleId },
    include: { brand: true },
  });

  if (!rule || !rule.isActive) {
    return;
  }

  await prisma.$transaction([
    prisma.automationRule.update({
      where: { id: rule.id },
      data: { lastRunAt: new Date() },
    }),
    prisma.notification.create({
      data: {
        userId: rule.brand.userId,
        type: "automation_ran",
        title: `Automation ran: ${rule.name}`,
        body: "Automated generation wiring lands in a later phase.",
      },
    }),
  ]);

  console.log(`[run-automation-rule] ${rule.id} (${rule.name}) executed.`);
}
