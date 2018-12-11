export class ConfigManager {
  private static instance: ConfigManager;

  private configFile: string;

  public appConfig: any;

  private constructor() {
  }

  public async loadConfig(configFile: string) {
    this.configFile = configFile;

    const response = await fetch(this.configFile);
    return await response.json();
  }

  static getInstance(): ConfigManager {
    if (!this.instance) {
      this.instance = new ConfigManager();
    }
    return this.instance;
  }
}