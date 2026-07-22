"use server";

import { revalidatePath } from "next/cache";

import { prisma, type Platform } from "@postpylot/db";

import { getDashboardUser } from "@/lib/auth/get-dashboard-user";
import { enqueueRunAutomationRule } from "@/lib/jobs/queue";
import { createRuleSchema } from "@/lib/automation/schemas";

export type AutomationActionResult =
  | { ok: true }
  | { ok: false; error: string };

async function ownedRule(userId: string, ruleId: string) {
  return prisma.automationRule.findFirst({
    where: { id: ruleId, brand: { userId } },
    select: { id: true },
  });
}

export async function createAutomationRuleAction(
  input: unknown
): Promise<AutomationActionResult> {
  const user = await getDashboardUser();

  const parsed = createRuleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please fill in the rule name and frequency." };
  }

  const brand = await prisma.brand.findFirst({
    where: { id: parsed.data.brandId, userId: user.id },
    select: { id: true },
  });
  if (!brand) return { ok: false, error: "Brand not found." };

  await prisma.automationRule.create({
    data: {
      brandId: brand.id,
      name: parsed.data.name,
      platform: (parsed.data.platform as Platform | undefined) ?? null,
      frequency: parsed.data.frequency,
      isActive: true,
    },
  });

  revalidatePath("/dashboard/calendar");
  return { ok: true };
}

export async function setAutomationActiveAction(
  ruleId: string,
  isActive: boolean
): Promise<AutomationActionResult> {
  const user = await getDashboardUser();
  const rule = await ownedRule(user.id, ruleId);
  if (!rule) return { ok: false, error: "Rule not found." };

  await prisma.automationRule.update({
    where: { id: rule.id },
    data: { isActive },
  });

  revalidatePath("/dashboard/calendar");
  return { ok: true };
}

export async function deleteAutomationRuleAction(
  ruleId: string
): Promise<AutomationActionResult> {
  const user = await getDashboardUser();
  const rule = await ownedRule(user.id, ruleId);
  if (!rule) return { ok: false, error: "Rule not found." };

  await prisma.automationRule.delete({ where: { id: rule.id } });

  revalidatePath("/dashboard/calendar");
  return { ok: true };
}

export async function runAutomationRuleNowAction(
  ruleId: string
): Promise<AutomationActionResult> {
  const user = await getDashboardUser();
  const rule = await ownedRule(user.id, ruleId);
  if (!rule) return { ok: false, error: "Rule not found." };

  try {
    await enqueueRunAutomationRule(rule.id);
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? `Could not run: ${error.message}`
          : "Could not run rule.",
    };
  }

  revalidatePath("/dashboard/calendar");
  return { ok: true };
}
