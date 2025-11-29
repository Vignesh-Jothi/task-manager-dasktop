import React, { useState, useEffect } from "react";
import "../styles/Settings.css";

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"jira" | "github">("jira");

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

  return (
    <div className="settings-container">
      <h2>Settings</h2>

      <div className="settings-tabs">
        <button
          className={activeTab === "jira" ? "active" : ""}
          onClick={() => setActiveTab("jira")}
        >
          Jira Integration
        </button>
        <button
          className={activeTab === "github" ? "active" : ""}
          onClick={() => setActiveTab("github")}
        >
          GitHub Backup
        </button>
      </div>

      {activeTab === "jira" && (
        <div className="settings-panel">
          <h3>Jira Configuration</h3>
          <p className="settings-description">
            Connect to Jira to automatically sync tasks as issues. Your API
            token is encrypted and stored locally.
          </p>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={jiraAutoSync}
                onChange={(e) => setJiraAutoSync(e.target.checked)}
              />
              Enable Jira Auto-Sync
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="jira-domain">Jira Domain</label>
            <input
              type="text"
              id="jira-domain"
              placeholder="yourcompany.atlassian.net"
              value={jiraDomain}
              onChange={(e) => setJiraDomain(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="jira-email">Email</label>
            <input
              type="email"
              id="jira-email"
              placeholder="your-email@example.com"
              value={jiraEmail}
              onChange={(e) => setJiraEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="jira-token">API Token</label>
            <input
              type="password"
              id="jira-token"
              placeholder="Your Jira API token"
              value={jiraApiToken}
              onChange={(e) => setJiraApiToken(e.target.value)}
            />
            <small>
              Generate at: https://id.atlassian.com/manage/api-tokens
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="jira-project">Project Key</label>
            <input
              type="text"
              id="jira-project"
              placeholder="PROJ"
              value={jiraProjectKey}
              onChange={(e) => setJiraProjectKey(e.target.value)}
            />
          </div>

          <div className="settings-actions">
            <button onClick={handleSaveJira} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
            <button onClick={handleTestJira} className="secondary">
              Test Connection
            </button>
          </div>
        </div>
      )}

      {activeTab === "github" && (
        <div className="settings-panel">
          <h3>GitHub Backup Configuration</h3>
          <p className="settings-description">
            Backup your tasks and logs to a private GitHub repository. Your
            token is encrypted and stored locally.
          </p>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={githubEnabled}
                onChange={(e) => setGithubEnabled(e.target.checked)}
              />
              Enable GitHub Backup
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="github-token">Personal Access Token</label>
            <input
              type="password"
              id="github-token"
              placeholder="ghp_..."
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
            />
            <small>
              Generate at: https://github.com/settings/tokens (repo scope
              required)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="github-repo">Repository</label>
            <input
              type="text"
              id="github-repo"
              placeholder="username/repo-name"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={githubAutoSync}
                onChange={(e) => setGithubAutoSync(e.target.checked)}
              />
              Enable Auto-Sync
            </label>
          </div>

          {githubAutoSync && (
            <div className="form-group">
              <label htmlFor="github-interval">Sync Interval</label>
              <select
                id="github-interval"
                value={githubSyncInterval}
                onChange={(e) =>
                  setGithubSyncInterval(e.target.value as "daily" | "manual")
                }
              >
                <option value="daily">Daily (2 AM)</option>
                <option value="manual">Manual Only</option>
              </select>
            </div>
          )}

          <div className="settings-actions">
            <button onClick={handleSaveGitHub} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
            <button onClick={handleTestGitHub} className="secondary">
              Test Connection
            </button>
            <button
              onClick={handleSyncGitHub}
              disabled={isSyncing}
              className="primary"
            >
              {isSyncing ? "Syncing..." : "Sync Now"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
