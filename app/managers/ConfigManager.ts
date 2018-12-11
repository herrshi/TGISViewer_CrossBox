export class ConfigManager {
  private static instance: ConfigManager;

  private constructor(configFile: string) {

  }

  static getInstance(configFile: string): ConfigManager {
    if (!this.instance) {
      this.instance = new ConfigManager(configFile);
    }
    return this.instance;
  }
}