import { SettingsSubNav } from "@/components/dashboard/settings-sub-nav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <SettingsSubNav />
      {children}
    </div>
  );
}
