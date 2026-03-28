import { SetupWizard } from "@/components/setup/setup-wizard";
import { useSettings } from "@/hooks/use-settings";

export function SetupPage() {
  const { settings, saveSettings } = useSettings();

  return <SetupWizard initialSettings={settings} onSave={saveSettings} />;
}
