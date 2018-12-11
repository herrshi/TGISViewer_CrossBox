import {ConfigManager} from "app/managers/ConfigManager";

import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");

class Map {

  constructor(params: any) {
    const configManager:ConfigManager = ConfigManager.getInstance();
    configManager.loadConfig(params.config).then(appConfig => {
      configManager.appConfig = appConfig;
    });

    const map = new EsriMap({
      basemap: "streets"
    });

    const view = new MapView({
      map: map,
      container: "viewDiv",
      center: [-118.244, 34.052],
      zoom: 12
    });
  }
}

export {Map}
