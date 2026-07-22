import type { Metadata } from "next";
import { Calendar } from "lucide-react";

import { PLATFORM_LABELS, type Platform } from "@postpylot/shared";

import { PageHeader } from "@/components/dashboard/page-header";
import {
  AutomationRules,
  type RuleView,
} from "@/components/automation/automation-rules";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardUser } from "@/lib/auth/get-dashboard-user";
import { getAutomationRules } from "@/lib/automation/queries";
import { getUpcomingSchedules } from "@/lib/calendar/queries";
import { prisma } from "@postpylot/db";

export const metadata: Metadata = {
  title: "Calendar",
};

export default async function CalendarPage() {
  const user = await getDashboardUser();
  const [schedules, rules, brands] = await Promise.all([
    getUpcomingSchedules(user.id),
    getAutomationRules(user.id),
    prisma.brand.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  const ruleViews: RuleView[] = rules.map((rule) => ({
    id: rule.id,
    name: rule.name,
    brandName: rule.brand.name,
    platform: (rule.platform as Platform | null) ?? null,
    frequency: rule.frequency,
    isActive: rule.isActive,
    lastRunAt: rule.lastRunAt?.toISOString() ?? null,
  }));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <PageHeader
        title="Calendar"
        description="Upcoming scheduled posts and the automation rules that keep your pipeline running."
      />

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Upcoming</h2>
        {schedules.length === 0 ? (
          <Card>
            <CardContent className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
              <Calendar className="size-4" aria-hidden />
              Nothing scheduled. Schedule a post from the Posts page.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {schedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    {schedule.post ? (
                      <Badge variant="outline">
                        {PLATFORM_LABELS[schedule.post.platform as Platform]}
                      </Badge>
                    ) : null}
                    <span className="text-muted-foreground">
                      {schedule.brand.name}
                    </span>
                  </CardTitle>
                  <Badge variant="secondary">
                    {new Date(schedule.scheduledAt).toLocaleString()}
                  </Badge>
                </CardHeader>
                {schedule.post ? (
                  <CardContent className="line-clamp-2 text-sm text-muted-foreground">
                    {schedule.post.content}
                  </CardContent>
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Automation</h2>
        {brands.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Create a brand to set up automation rules.
          </p>
        ) : (
          <AutomationRules brands={brands} rules={ruleViews} />
        )}
      </section>
    </div>
  );
}
