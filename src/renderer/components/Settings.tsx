import React, { useState, useEffect } from "react";
import "../styles/Settings.css";
import "../styles/theme.css";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Switch } from "./ui/switch";

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "jira" | "github" | "data" | "reports" | "features"
  >("jira");
  // Email summary settings
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [emailDaily, setEmailDaily] = useState(true);
  const [emailWeekly, setEmailWeekly] = useState(true);
  const [emailMonthly, setEmailMonthly] = useState(true);
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  // Feature flags
  const [enableSplash, setEnableSplash] = useState(true);
  const [enableTooltips, setEnableTooltips] = useState(true);
  const [enableEmailSummaries, setEnableEmailSummaries] = useState(true);
  const [savingFlags, setSavingFlags] = useState(false);

  // Jira settings
  const [jiraEnabled, setJiraEnabled] = useState(false);
  const [jiraDomain, setJiraDomain] = useState("");
  const [jiraEmail, setJiraEmail] = useState("");
  const [jiraApiToken, setJiraApiToken] = useState("");
  const [jiraProjectKey, setJiraProjectKey] = useState("");
  const [jiraAutoSync, setJiraAutoSync] = useState(false);

  // GitHub settings
  const [githubEnabled, setGithubEnabled] = useState(false);
  const [githubToken, setGithubToken] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [githubAutoSync, setGithubAutoSync] = useState(false);
  const [githubSyncInterval, setGithubSyncInterval] = useState<
    "daily" | "manual"
  >("daily");

  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const jiraSettings = await window.api.getJiraSettings();
      if (jiraSettings) {
        setJiraEnabled(jiraSettings.autoSync);
        setJiraDomain(jiraSettings.domain);
        setJiraEmail(jiraSettings.email);
        setJiraApiToken(jiraSettings.apiToken);
        setJiraProjectKey(jiraSettings.projectKey);
        setJiraAutoSync(jiraSettings.autoSync);
      }

      const githubSettings = await window.api.getGitHubSettings();
      if (githubSettings) {
        setGithubEnabled(githubSettings.enabled);
        setGithubToken(githubSettings.token);
        setGithubRepo(githubSettings.repo);
        setGithubAutoSync(githubSettings.autoSync);
        setGithubSyncInterval(githubSettings.syncInterval);
      }

      const emailConfig = await window.api.getEmailConfig();
      if (emailConfig) {
        const flags = await window.api.getFeatureFlags();
        if (flags) {
          setEnableSplash(flags.enableSplash);
          setEnableTooltips(flags.enableTooltips);
          setEnableEmailSummaries(flags.enableEmailSummaries);
        }
        setEmailEnabled(emailConfig.enabled);
        setEmailTo(emailConfig.to);
        setSmtpHost(emailConfig.smtp.host);
        setSmtpPort(emailConfig.smtp.port);
        setSmtpSecure(emailConfig.smtp.secure);
        setSmtpUser(emailConfig.smtp.user);
        setSmtpPass(emailConfig.smtp.pass);
        setEmailDaily(emailConfig.daily);
        setEmailWeekly(emailConfig.weekly);
        setEmailMonthly(emailConfig.monthly);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const handleSaveJira = async () => {
    setIsSaving(true);
    try {
      await window.api.saveJiraSettings({
        enabled: jiraEnabled,
        domain: jiraDomain,
        email: jiraEmail,
        apiToken: jiraApiToken,
        projectKey: jiraProjectKey,
        autoSync: jiraAutoSync,
      });
      alert("Jira settings saved successfully");
    } catch (error) {
      console.error("Failed to save Jira settings:", error);
      alert("Failed to save Jira settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestJira = async () => {
    try {
      const success = await window.api.testJiraConnection();
      alert(success ? "Jira connection successful!" : "Jira connection failed");
    } catch (error) {
      alert("Jira connection failed");
    }
  };

  const handleSaveGitHub = async () => {
    setIsSaving(true);
    try {
      await window.api.saveGitHubSettings({
        enabled: githubEnabled,
        token: githubToken,
        repo: githubRepo,
        autoSync: githubAutoSync,
        syncInterval: githubSyncInterval,
      });
      alert("GitHub settings saved successfully");
    } catch (error) {
      console.error("Failed to save GitHub settings:", error);
      alert("Failed to save GitHub settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestGitHub = async () => {
    try {
      const success = await window.api.testGitHubConnection();
      alert(
        success ? "GitHub connection successful!" : "GitHub connection failed"
      );
    } catch (error) {
      alert("GitHub connection failed");
    }
  };

  const handleSyncGitHub = async () => {
    setIsSyncing(true);
    try {
      const result = await window.api.syncToGitHub();
      alert(result.success ? result.message : `Sync failed: ${result.message}`);
    } catch (error) {
      alert("GitHub sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearCache = async () => {
    if (
      !confirm(
        "Clear all cached data? The app will restart automatically. Your tasks will not be affected."
      )
    ) {
      return;
    }
    try {
      localStorage.clear();
      sessionStorage.clear();

      // Show success message
      alert("Cache cleared successfully! The app will restart now.");

      // Restart the application
      await window.api.relaunchApp();
    } catch (error) {
      console.error("Failed to clear cache:", error);
      alert("Failed to clear cache");
    }
  };

  const handleDeleteAllTasks = async () => {
    setIsDeleting(true);
    try {
      const tasks = await window.api.getAllTasks();
      let deletedCount = 0;

      for (const task of tasks) {
        const success = await window.api.deleteTask(task.id);
        if (success) deletedCount++;
      }

      alert(`Successfully deleted ${deletedCount} task(s)`);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete tasks:", error);
      alert("Failed to delete tasks");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCompletedTasks = async () => {
    setIsDeleting(true);
    try {
      const tasks = await window.api.getAllTasks();
      const completedTasks = tasks.filter((t) => t.status === "completed");
      let deletedCount = 0;

      for (const task of completedTasks) {
        const success = await window.api.deleteTask(task.id);
        if (success) deletedCount++;
      }

      alert(`Successfully deleted ${deletedCount} completed task(s)`);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete completed tasks:", error);
      alert("Failed to delete completed tasks");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteGitHubData = async () => {
    setIsDeleting(true);
    try {
      // Clear GitHub settings
      await window.api.saveGitHubSettings({
        enabled: false,
        token: "",
        repo: "",
        autoSync: false,
        syncInterval: "manual",
      });

      setGithubEnabled(false);
      setGithubToken("");
      setGithubRepo("");
      setGithubAutoSync(false);
      setGithubSyncInterval("manual");

      alert("GitHub data and settings cleared successfully");
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete GitHub data:", error);
      alert("Failed to delete GitHub data");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEmail = async () => {
    setEmailSaving(true);
    try {
      await window.api.saveEmailConfig({
        enabled: emailEnabled,
        to: emailTo,
        smtp: {
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          user: smtpUser,
          pass: smtpPass,
        },
        daily: emailDaily,
        weekly: emailWeekly,
        monthly: emailMonthly,
      });
      alert("Email summary settings saved");
    } catch (e) {
      alert("Failed to save email settings");
    } finally {
      setEmailSaving(false);
    }
  };

  const handleSendTestSummary = async (
    type: "daily" | "weekly" | "monthly"
  ) => {
    setEmailSending(true);
    try {
      const summary = await window.api.generateSummary(type);
      await window.api.sendSummaryEmail(type);
      alert(
        `${type} summary email queued. Preview:\n\n${summary.plain.slice(
          0,
          400
        )}...`
      );
    } catch (e) {
      alert("Failed to send summary email");
    } finally {
      setEmailSending(false);
    }
  };

  const handleSaveFlags = async () => {
    setSavingFlags(true);
    try {
      console.log("Saving feature flags:", {
        enableSplash,
        enableTooltips,
        enableEmailSummaries,
      });
      const result = await window.api.saveFeatureFlags({
        enableSplash,
        enableTooltips,
        enableEmailSummaries,
      });
      alert("Feature flags saved successfully");
    } catch (e) {
      console.error("Failed to save feature flags:", e);
      alert(
        "Failed to save feature flags: " +
          (e instanceof Error ? e.message : String(e))
      );
    } finally {
      setSavingFlags(false);
    }
  };

  return (
    <div className="settings-container space-y-4">
      <h2 className="text-2xl font-bold text-[color:var(--text-primary)]">
        Settings
      </h2>

      <Card>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={activeTab === "jira" ? "default" : "outline"}
              onClick={() => setActiveTab("jira")}
            >
              Jira Integration
            </Button>
            <Button
              variant={activeTab === "github" ? "default" : "outline"}
              onClick={() => setActiveTab("github")}
            >
              GitHub Backup
            </Button>
            <Button
              variant={activeTab === "data" ? "default" : "outline"}
              onClick={() => setActiveTab("data")}
            >
              🗑️ Data Management
            </Button>
            <Button
              variant={activeTab === "reports" ? "default" : "outline"}
              onClick={() => setActiveTab("reports")}
            >
              📧 Reports & Email
            </Button>
            <Button
              variant={activeTab === "features" ? "default" : "outline"}
              onClick={() => setActiveTab("features")}
            >
              🧩 Feature Flags
            </Button>
          </div>
        </CardContent>
      </Card>

      {activeTab === "theme" && (
        <Card>
          <CardHeader>
            <CardTitle>Theme Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[color:var(--text-secondary)] mb-6">
              Customize your app appearance and enable automatic theme
              switching.
            </p>
            <div className="space-y-6">
              {/* Import ThemeProvider hook */}
              <ThemeSection />
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "jira" && (
        <Card>
          <CardHeader>
            <CardTitle>Jira Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[color:var(--text-secondary)] mb-4">
              Connect to Jira to automatically sync tasks as issues. Your API
              token is encrypted and stored locally.
            </p>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[color:var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={jiraAutoSync}
                  onChange={(e) => setJiraAutoSync(e.target.checked)}
                />
                Enable Jira Auto-Sync
              </label>

              <div className="space-y-2">
                <label
                  htmlFor="jira-domain"
                  className="text-sm text-[color:var(--text-primary)]"
                >
                  Jira Domain
                </label>
                <Input
                  type="text"
                  id="jira-domain"
                  placeholder="yourcompany.atlassian.net"
                  value={jiraDomain}
                  onChange={(e) => setJiraDomain(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="jira-email"
                  className="text-sm text-[color:var(--text-primary)]"
                >
                  Email
                </label>
                <Input
                  type="email"
                  id="jira-email"
                  placeholder="your-email@example.com"
                  value={jiraEmail}
                  onChange={(e) => setJiraEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="jira-token"
                  className="text-sm text-[color:var(--text-primary)]"
                >
                  API Token
                </label>
                <Input
                  type="password"
                  id="jira-token"
                  placeholder="Your Jira API token"
                  value={jiraApiToken}
                  onChange={(e) => setJiraApiToken(e.target.value)}
                />
                <small className="text-xs text-[color:var(--text-muted)]">
                  Generate at: https://id.atlassian.com/manage/api-tokens
                </small>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="jira-project"
                  className="text-sm text-[color:var(--text-primary)]"
                >
                  Project Key
                </label>
                <Input
                  type="text"
                  id="jira-project"
                  placeholder="PROJ"
                  value={jiraProjectKey}
                  onChange={(e) => setJiraProjectKey(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveJira} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Settings"}
                </Button>
                <Button onClick={handleTestJira} variant="outline">
                  Test Connection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "github" && (
        <Card>
          <CardHeader>
            <CardTitle>GitHub Backup Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[color:var(--text-secondary)] mb-4">
              Backup your tasks and logs to a private GitHub repository. Your
              token is encrypted and stored locally.
            </p>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[color:var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={githubEnabled}
                  onChange={(e) => setGithubEnabled(e.target.checked)}
                />
                Enable GitHub Backup
              </label>

              <div className="space-y-2">
                <label
                  htmlFor="github-token"
                  className="text-sm text-[color:var(--text-primary)]"
                >
                  Personal Access Token
                </label>
                <Input
                  type="password"
                  id="github-token"
                  placeholder="ghp_..."
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                />
                <small className="text-xs text-[color:var(--text-muted)]">
                  Generate at: https://github.com/settings/tokens (repo scope
                  required)
                </small>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="github-repo"
                  className="text-sm text-[color:var(--text-primary)]"
                >
                  Repository
                </label>
                <Input
                  type="text"
                  id="github-repo"
                  placeholder="username/repo-name"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                />
              </div>

              <label className="flex items-center gap-2 text-[color:var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={githubAutoSync}
                  onChange={(e) => setGithubAutoSync(e.target.checked)}
                />
                Enable Auto-Sync
              </label>

              {githubAutoSync && (
                <div className="space-y-2">
                  <label
                    htmlFor="github-interval"
                    className="text-sm text-[color:var(--text-primary)]"
                  >
                    Sync Interval
                  </label>
                  <Select
                    id="github-interval"
                    value={githubSyncInterval}
                    onChange={(e) =>
                      setGithubSyncInterval(
                        e.target.value as "daily" | "manual"
                      )
                    }
                  >
                    <option value="daily">Daily (2 AM)</option>
                    <option value="manual">Manual Only</option>
                  </Select>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSaveGitHub} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Settings"}
                </Button>
                <Button onClick={handleTestGitHub} variant="outline">
                  Test Connection
                </Button>
                <Button onClick={handleSyncGitHub} disabled={isSyncing}>
                  {isSyncing ? "Syncing..." : "Sync Now"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "data" && (
        <div className="space-y-4">
          {/* Cache Management */}
          <Card>
            <CardHeader>
              <CardTitle>Cache Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[color:var(--text-secondary)] mb-4">
                Clear application cache including theme preferences, filter
                settings, and temporary data. Your tasks will not be affected.
              </p>
              <Button onClick={handleClearCache} variant="outline">
                🧹 Clear Cache
              </Button>
            </CardContent>
          </Card>

          {/* Task Deletion */}
          <Card className="border-l-4 border-l-[var(--warning)]">
            <CardHeader>
              <CardTitle>Delete Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[color:var(--text-secondary)] mb-4">
                Permanently delete tasks from local storage. This action cannot
                be undone.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[var(--bg-sidebar)] rounded-lg">
                  <div>
                    <p className="font-medium text-[color:var(--text-primary)]">
                      Delete Completed Tasks
                    </p>
                    <p className="text-xs text-[color:var(--text-muted)]">
                      Remove all tasks marked as completed
                    </p>
                  </div>
                  {showDeleteConfirm === "completed" ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleDeleteCompletedTasks}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Confirm"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(null)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowDeleteConfirm("completed")}
                    >
                      Delete
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-[var(--bg-sidebar)] rounded-lg">
                  <div>
                    <p className="font-medium text-[color:var(--text-primary)]">
                      Delete All Tasks
                    </p>
                    <p className="text-xs text-[color:var(--text-muted)]">
                      Remove all tasks permanently
                    </p>
                  </div>
                  {showDeleteConfirm === "all" ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleDeleteAllTasks}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Confirm"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(null)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm("all")}
                    >
                      Delete All
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GitHub Data Deletion */}
          <Card className="border-l-4 border-l-[var(--error)]">
            <CardHeader>
              <CardTitle>Delete Synced Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[color:var(--text-secondary)] mb-4">
                Clear GitHub sync settings and credentials. This will not delete
                data from your GitHub repository.
              </p>
              <div className="flex items-center justify-between p-3 bg-[var(--bg-sidebar)] rounded-lg">
                <div>
                  <p className="font-medium text-[color:var(--text-primary)]">
                    Clear GitHub Settings
                  </p>
                  <p className="text-xs text-[color:var(--text-muted)]">
                    Remove token and repository configuration
                  </p>
                </div>
                {showDeleteConfirm === "github" ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleDeleteGitHubData}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Confirm"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(null)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm("github")}
                  >
                    Clear Settings
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Warning Notice */}
          <Card className="bg-[var(--warning)]/10 border border-[var(--warning)]/30">
            <CardContent className="pt-4">
              <div className="flex gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold text-[color:var(--warning)]">
                    Warning
                  </p>
                  <p className="text-sm text-[color:var(--text-secondary)] mt-1">
                    Deletion actions are permanent and cannot be undone. Make
                    sure to backup your data before proceeding.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "reports" && (
        <Card>
          <CardHeader>
            <CardTitle>Automated Summary Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[color:var(--text-secondary)] mb-4">
              Receive daily (07:00), weekly (Friday 07:00), and monthly (30th
              07:00) task summaries. Credentials are stored locally.
            </p>
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[color:var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                />
                Enable Email Summaries
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm">Recipient Email</label>
                  <Input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">SMTP Host</label>
                  <Input
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.mailprovider.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">SMTP Port</label>
                  <Input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">SMTP User</label>
                  <Input
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="user@domain.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">SMTP Password</label>
                  <Input
                    type="password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                  />
                </div>
                <div className="space-y-2 flex items-end">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={smtpSecure}
                      onChange={(e) => setSmtpSecure(e.target.checked)}
                    />
                    Use TLS/SSL
                  </label>
                </div>
              </div>
              <div className="flex gap-4 flex-wrap">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={emailDaily}
                    onChange={(e) => setEmailDaily(e.target.checked)}
                  />
                  Daily
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={emailWeekly}
                    onChange={(e) => setEmailWeekly(e.target.checked)}
                  />
                  Weekly (Fri)
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={emailMonthly}
                    onChange={(e) => setEmailMonthly(e.target.checked)}
                  />
                  Monthly (30th)
                </label>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={handleSaveEmail} disabled={emailSaving}>
                  {emailSaving ? "Saving..." : "Save Email Settings"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSendTestSummary("daily")}
                  disabled={emailSending}
                >
                  {emailSending ? "Sending..." : "Send Daily Now"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSendTestSummary("weekly")}
                  disabled={emailSending}
                >
                  Weekly Preview
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSendTestSummary("monthly")}
                  disabled={emailSending}
                >
                  Monthly Preview
                </Button>
              </div>
              <p className="text-xs text-[color:var(--text-muted)]">
                Your SMTP credentials are stored locally in plain text. Use a
                dedicated app password if available.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "features" && (
        <Card>
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[color:var(--text-secondary)] mb-6">
              Control which features are enabled. Changes take effect
              immediately.
            </p>
            <div className="space-y-6">
              {/* Startup & UI Features */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[color:var(--text-primary)] uppercase tracking-wide">
                  Startup & Interface
                </h3>
                <div className="flex items-center justify-between p-4 bg-[var(--bg-sidebar)] rounded-lg hover:bg-[var(--bg-app)] transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-[color:var(--text-primary)]">
                      Startup Splash Animation
                    </div>
                    <div className="text-sm text-[color:var(--text-muted)] mt-1">
                      Show animated loading screen when app starts
                    </div>
                  </div>
                  <Switch
                    checked={enableSplash}
                    onCheckedChange={setEnableSplash}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-[var(--bg-sidebar)] rounded-lg hover:bg-[var(--bg-app)] transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-[color:var(--text-primary)]">
                      Tooltips
                    </div>
                    <div className="text-sm text-[color:var(--text-muted)] mt-1">
                      Display helpful hints when hovering over UI elements
                    </div>
                  </div>
                  <Switch
                    checked={enableTooltips}
                    onCheckedChange={setEnableTooltips}
                  />
                </div>
              </div>

              {/* Automation Features */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[color:var(--text-primary)] uppercase tracking-wide">
                  Automation & Notifications
                </h3>
                <div className="flex items-center justify-between p-4 bg-[var(--bg-sidebar)] rounded-lg hover:bg-[var(--bg-app)] transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-[color:var(--text-primary)]">
                      Email Summary Reports
                    </div>
                    <div className="text-sm text-[color:var(--text-muted)] mt-1">
                      Receive daily, weekly, and monthly task summaries via
                      email
                    </div>
                  </div>
                  <Switch
                    checked={enableEmailSummaries}
                    onCheckedChange={setEnableEmailSummaries}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-[var(--bg-sidebar)] rounded-lg hover:bg-[var(--bg-app)] transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-[color:var(--text-primary)]">
                      Deadline Notifications
                    </div>
                    <div className="text-sm text-[color:var(--text-muted)] mt-1">
                      Receive alerts for upcoming task deadlines
                    </div>
                  </div>
                  <Switch
                    checked={true}
                    onCheckedChange={() => {}}
                    disabled={true}
                  />
                </div>
              </div>

              {/* Integration Features */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[color:var(--text-primary)] uppercase tracking-wide">
                  Integrations
                </h3>
                <div className="flex items-center justify-between p-4 bg-[var(--bg-sidebar)] rounded-lg hover:bg-[var(--bg-app)] transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-[color:var(--text-primary)]">
                      Jira Sync
                    </div>
                    <div className="text-sm text-[color:var(--text-muted)] mt-1">
                      Automatically sync tasks with Jira issues
                    </div>
                  </div>
                  <Switch
                    checked={true}
                    onCheckedChange={() => {}}
                    disabled={true}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-[var(--bg-sidebar)] rounded-lg hover:bg-[var(--bg-app)] transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-[color:var(--text-primary)]">
                      GitHub Backup
                    </div>
                    <div className="text-sm text-[color:var(--text-muted)] mt-1">
                      Backup tasks and logs to GitHub repository
                    </div>
                  </div>
                  <Switch
                    checked={true}
                    onCheckedChange={() => {}}
                    disabled={true}
                  />
                </div>
              </div>

              {/* Performance Features */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[color:var(--text-primary)] uppercase tracking-wide">
                  Performance
                </h3>
                <div className="flex items-center justify-between p-4 bg-[var(--bg-sidebar)] rounded-lg hover:bg-[var(--bg-app)] transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-[color:var(--text-primary)]">
                      Virtual Scrolling
                    </div>
                    <div className="text-sm text-[color:var(--text-muted)] mt-1">
                      Optimize rendering for large task lists (100+ items)
                    </div>
                  </div>
                  <Switch
                    checked={true}
                    onCheckedChange={() => {}}
                    disabled={true}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-[var(--bg-sidebar)] rounded-lg hover:bg-[var(--bg-app)] transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-[color:var(--text-primary)]">
                      Animation Effects
                    </div>
                    <div className="text-sm text-[color:var(--text-muted)] mt-1">
                      Enable smooth transitions and visual effects
                    </div>
                  </div>
                  <Switch
                    checked={true}
                    onCheckedChange={() => {}}
                    disabled={true}
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-[color:var(--text-muted)]/20">
              <Button onClick={handleSaveFlags} disabled={savingFlags}>
                {savingFlags ? "Saving..." : "💾 Save Feature Flags"}
              </Button>
              <p className="text-xs text-[color:var(--text-muted)] mt-3">
                Note: Some features marked as "always enabled" are core to the
                app and cannot be disabled.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Settings;
