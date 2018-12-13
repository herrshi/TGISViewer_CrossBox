export default class ConfigManager {
  private static instance: ConfigManager;

  public appConfig: any;

  private constructor() {}

  public async loadConfig(configFile: string) {
    const response = await fetch(configFile);
    this.appConfig = await response.json();
  }

  static getInstance(): ConfigManager {
    if (!this.instance) {
      this.instance = new ConfigManager();
    }
    return this.instance;
  }
}
