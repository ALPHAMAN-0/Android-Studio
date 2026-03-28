import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, MessageCircle, CheckCircle2, AlertCircle, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { testConnection } from "@/lib/services/telegram";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import type { AppSettings } from "@/types";

interface SetupWizardProps {
  initialSettings?: AppSettings | null;
  onSave: (settings: AppSettings) => Promise<void>;
}

const STEPS = [
  "Open Telegram and search for @BotFather",
  "Send /newbot and follow the steps to create a bot",
  "Copy the bot token and paste it above",
  "Create a private Telegram channel",
  "Add your bot as an admin to the channel",
  "Get the channel ID (forward a message to @userinfobot)",
];

export function SetupWizard({ initialSettings, onSave }: SetupWizardProps) {
  const [botToken, setBotToken] = useState(initialSettings?.botToken || "");
  const [channelId, setChannelId] = useState(initialSettings?.channelId || "");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleTest = async () => {
    if (!botToken.trim()) return;
    setTesting(true);
    setTestResult(null);

    const result = await testConnection(botToken.trim());
    if (result.ok) {
      setTestResult({ ok: true, message: `Connected to bot: ${result.botName}` });
    } else {
      setTestResult({ ok: false, message: result.error || "Connection failed" });
    }
    setTesting(false);
  };

  const handleSave = async () => {
    if (!botToken.trim() || !channelId.trim()) return;
    setSaving(true);
    await onSave({ botToken: botToken.trim(), channelId: channelId.trim() });
    setSaving(false);
    // Force full reload so AppRoutes re-reads settings from storage
    window.location.href = "/drive";
  };

  const isValid = botToken.trim() && channelId.trim();

  return (
    <div className="min-h-screen flex flex-col bg-background animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" width={32} height={32} className="rounded-lg" />
          <span className="font-bold text-lg tracking-tight">Unlimitade Storage</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-3">
            <div className="w-18 h-18 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Setup Your Storage</h1>
            <p className="text-muted-foreground text-sm">
              Connect your Telegram bot to start storing files for free.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 space-y-5 shadow-card">
            {/* Bot Token */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Bot className="w-4 h-4 text-brand" />
                Bot Token
              </label>
              <Input
                type="password"
                placeholder="123456789:ABCdefGHIjklMNO..."
                value={botToken}
                onChange={(e) => {
                  setBotToken(e.target.value);
                  setTestResult(null);
                }}
              />
              <p className="text-[11px] text-muted-foreground">
                Create a bot via @BotFather on Telegram and paste the token here.
              </p>
            </div>

            {/* Test Connection */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={!botToken.trim() || testing}
              className="w-full rounded-xl h-10"
            >
              {testing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : testResult?.ok ? (
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
              ) : testResult ? (
                <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
              ) : null}
              {testing ? "Testing..." : "Test Connection"}
            </Button>

            {testResult && (
              <p className={`text-sm font-medium ${testResult.ok ? "text-green-600" : "text-red-600"}`}>
                {testResult.message}
              </p>
            )}

            {/* Channel ID */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-brand" />
                Channel ID
              </label>
              <Input
                placeholder="-1001234567890"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                Create a private channel, add your bot as admin, then get the channel ID.
              </p>
            </div>

            {/* Save */}
            <Button
              onClick={handleSave}
              disabled={!isValid || saving}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 h-11 text-base font-semibold rounded-xl active:scale-[0.98] transition-all duration-150"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {initialSettings ? "Update Settings" : "Get Started"}
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4 shadow-card">
            <h3 className="font-semibold text-sm">How to set up</h3>
            <div className="space-y-3">
              {STEPS.map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
