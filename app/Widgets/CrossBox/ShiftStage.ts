import Map = require("esri/Map");
import MapImageLayer = require("esri/layers/MapImageLayer");

import MapManager from "app/Managers/MapManager";
import ConfigManager from "app/Managers/ConfigManager";

export default class ShiftStage {
  private static instance: ShiftStage;

  static getInstance(): ShiftStage {
    if (!this.instance) {
      this.instance = new ShiftStage();
    }

    return this.instance;
  }

  private stagesLayer: MapImageLayer;

  private map: Map;

  constructor() {
    this.map = MapManager.getInstance().map;
  }

  public async shiftStage(crossId: string, stage: string) {
    if (!this.stagesLayer) {
      const response = await fetch("app/Widgets/CrossBox/config.json");
      const crossBoxConfig = await response.json();
      let stageLayerUrl: string = crossBoxConfig.layers.stage;
      stageLayerUrl = stageLayerUrl.replace(/{gisServer}/i, ConfigManager.getInstance().appConfig.map.gisServer);
      this.stagesLayer = new MapImageLayer({
        url: stageLayerUrl,
        sublayers: [
          {
            id: 0,
            definitionExpression: `STAGES like '%${stage}%'`
          }
        ]
      });
      this.map.add(this.stagesLayer);
    }
  }
}