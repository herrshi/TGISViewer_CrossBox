import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");
import { ConfigManager } from "managers/ConfigManager";

export class Map {
  readonly rootDiv: string;
  private mapView: MapView;

  constructor(divName: string, projectConfig: string) {
    const configManager = ConfigManager.getInstance(projectConfig);
  }
}
