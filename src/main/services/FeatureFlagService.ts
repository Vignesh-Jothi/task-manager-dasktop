export interface FeatureFlags {
  enableSplash: boolean;
  enableTooltips: boolean;
  enableEmailSummaries: boolean;
}

export class FeatureFlagService {
  private fileSystem: any;
  private readonly FILE = "feature-flags.json";

  constructor(fileSystem: any) {
    this.fileSystem = fileSystem;
  }

  getFlags(): FeatureFlags {
    const data = this.fileSystem.loadConfig(this.FILE);
    return (
      data || {
        enableSplash: true,
        enableTooltips: true,
        enableEmailSummaries: true,
      }
    );
  }

  saveFlags(flags: FeatureFlags): void {
    this.fileSystem.saveConfig(this.FILE, flags);
  }
}
