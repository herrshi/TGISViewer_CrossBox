import Map = require("esri/Map");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
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

  //相位线的图层
  private stagesLayer: MapImageLayer;
  readonly signalLampLayer: GraphicsLayer;

  private map: Map;

  private appConfig: any;

  constructor() {
    this.map = MapManager.getInstance().map;
    this.appConfig = ConfigManager.getInstance().appConfig;

    this.signalLampLayer = new GraphicsLayer();
    this.map.add(this.signalLampLayer);
  }

  public async shiftStage(crossId: string, stage: string) {
    if (!this.stagesLayer) {
      await this.createStageLayer();
    }
    this.stagesLayer.findSublayerById(
      0
    ).definitionExpression = `STAGES like '%${stage}%'`;
    this.stagesLayer.refresh();
  }

  private async createStageLayer() {
    const response = await fetch(
      this.appConfig.viewerUrl + "/app/Widgets/CrossBox/config.json"
    );
    const crossBoxConfig = await response.json();
    let stageLayerUrl: string = crossBoxConfig.layers.stage;
    stageLayerUrl = stageLayerUrl.replace(
      /{gisServer}/i,
      ConfigManager.getInstance().appConfig.map.gisServer
    );
    this.stagesLayer = new MapImageLayer({
      url: stageLayerUrl
    });
    this.map.add(this.stagesLayer);
    return this.stagesLayer.when();
  }
}
