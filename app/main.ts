import { ConfigManager } from "app/managers/ConfigManager";
import { MapManager } from "app/managers/MapManager";

import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");

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

    // configManager.loadConfig(this.params.config).then(appConfig => {
    //   this.appConfig = configManager.appConfig = appConfig;
    //
    //   const mapManager: MapManager = MapManager.getInstance();
    // });

    // const map = new EsriMap({
    //   basemap: "streets"
    // });
    //
    // const view = new MapView({
    //   map: map,
    //   container: "viewDiv",
    //   center: [-118.244, 34.052],
    //   zoom: 12
    // });
  }
}

export { Map };
