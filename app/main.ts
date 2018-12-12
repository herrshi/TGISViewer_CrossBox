import { ConfigManager } from "app/Managers/ConfigManager";
import { MapManager } from "app/Managers/MapManager";
import GeometryUtils from "app/GeometryUtils/GeometryUtils";

class Map {
  private params: any;

  constructor(params: any) {
    this.params = params;
  }

  public async createMap() {
    const configManager: ConfigManager = ConfigManager.getInstance();
    await configManager.loadConfig(this.params.config);
    const mapManager: MapManager = MapManager.getInstance();
    return await mapManager.showMap(configManager.appConfig, this.params.container);
  }

  public async clipLineInLength(line: Array<Array<number>>, length: number) {
    return await GeometryUtils.clipPolylineInLength(line, length);
  }
}

export { Map };
