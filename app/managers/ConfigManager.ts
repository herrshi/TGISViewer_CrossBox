export class ConfigManager {
  private static instance: ConfigManager;

  public appConfig: any;

  private constructor() {}

  public async loadConfig(configFile: string) {
    const response = await fetch(configFile);
    return await response.json().then((appConfig: any) => {
      this.appConfig = appConfig;
    })
    // return new Promise(((resolve, reject) => {
    //   response.json().then(appConfig => {
    //     this.appConfig = appConfig;
    //     resolve(appConfig);
    //   });
    // }))
    // return await response.json();
  }

  static getInstance(): ConfigManager {
    if (!this.instance) {
      this.instance = new ConfigManager();
    }
    return this.instance;
  }
}
