"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pause, Play, Plus, Trash2, Zap } from "lucide-react";
import { PLATFORM_LABELS, type Platform } from "@postpylot/shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createAutomationRuleAction,
  deleteAutomationRuleAction,
  runAutomationRuleNowAction,
  setAutomationActiveAction,
} from "@/lib/automation/actions";

type BrandOption = { id: string; name: string };

export type RuleView = {
  id: string;
  name: string;
  brandName: string;
  platform: Platform | null;
  frequency: string;
  isActive: boolean;
  lastRunAt: string | null;
};

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every two weeks" },
  { value: "monthly", label: "Monthly" },
] as const;

const selectClass =
  "flex h-9 w-full rounded-lg border border-input bg-input/30 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function RuleCard({ rule }: { rule: RuleView }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          {rule.name}
          {rule.isActive ? (
            <Badge variant="secondary">Active</Badge>
          ) : (
            <Badge variant="outline">Paused</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          <span>{rule.brandName}</span>
          <span> &middot; {rule.frequency}</span>
          {rule.platform ? <span> &middot; {PLATFORM_LABELS[rule.platform]}</span> : null}
          {rule.lastRunAt ? (
            <span> &middot; last run {new Date(rule.lastRunAt).toLocaleDateString()}</span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {error ? <span className="text-xs text-destructive">{error}</span> : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => run(() => runAutomationRuleNowAction(rule.id))}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="animate-spin" aria-hidden /> : <Zap aria-hidden />}
            Run now
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => run(() => setAutomationActiveAction(rule.id, !rule.isActive))}
            disabled={isPending}
          >
            {rule.isActive ? <Pause aria-hidden /> : <Play aria-hidden />}
            {rule.isActive ? "Pause" : "Resume"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => run(() => deleteAutomationRuleAction(rule.id))}
            disabled={isPending}
          >
            <Trash2 aria-hidden />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function AutomationRules({
  brands,
  rules,
}: {
  brands: BrandOption[];
  rules: RuleView[];
}) {
  const router = useRouter();
  const [isCreating, startCreate] = useTransition();
  const [brandId, setBrandId] = useState(brands[0]?.id ?? "");
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState<string>("");
  const [frequency, setFrequency] = useState<string>("weekly");
  const [error, setError] = useState<string | null>(null);

  function handleCreate() {
    setError(null);
    startCreate(async () => {
      const result = await createAutomationRuleAction({
        brandId,
        name,
        platform: platform || undefined,
        frequency,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setName("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>New automation rule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="rule-brand">Brand</Label>
              <select
                id="rule-brand"
                value={brandId}
                onChange={(event) => setBrandId(event.target.value)}
                className={selectClass}
              >
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rule-name">Name</Label>
              <Input
                id="rule-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Weekly LinkedIn post"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rule-platform">Platform (optional)</Label>
              <select
                id="rule-platform"
                value={platform}
                onChange={(event) => setPlatform(event.target.value)}
                className={selectClass}
              >
                <option value="">Any</option>
                {Object.entries(PLATFORM_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rule-frequency">Frequency</Label>
              <select
                id="rule-frequency"
                value={frequency}
                onChange={(event) => setFrequency(event.target.value)}
                className={selectClass}
              >
                {FREQUENCIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="button"
            onClick={handleCreate}
            disabled={isCreating || !brandId || !name.trim()}
          >
            {isCreating ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <Plus aria-hidden />
            )}
            Add rule
          </Button>
        </CardContent>
      </Card>

      {rules.length ? (
        <div className="grid gap-3">
          {rules.map((rule) => (
            <RuleCard key={rule.id} rule={rule} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No automation rules yet. Create one to run generation on a cadence.
        </p>
      )}
    </div>
  );
}
