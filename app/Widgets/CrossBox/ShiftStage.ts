import Map = require("esri/Map");
import MapImageLayer = require("esri/layers/MapImageLayer");
import FeatureLayer = require("esri/layers/FeatureLayer");

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
  //相位标注图层
  private stageLabelLayer: FeatureLayer;

  private map: Map;

  private appConfig: any;
  private crossBoxConfig: any;

  constructor() {
    this.map = MapManager.getInstance().map;
    this.appConfig = ConfigManager.getInstance().appConfig;
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
    if (!this.crossBoxConfig) {
      const response = await fetch(
        this.appConfig.viewerUrl + "/app/Widgets/CrossBox/config.json"
      );
      this.crossBoxConfig = await response.json();
    }

    let stageLayerUrl: string = this.crossBoxConfig.layers.stage;
    stageLayerUrl = stageLayerUrl.replace(
      /{gisServer}/i,
      this.appConfig.map.gisServer
    );
    this.stagesLayer = new MapImageLayer({
      url: stageLayerUrl
    });
    this.map.add(this.stagesLayer);
    return this.stagesLayer.when();
  }

  /**显示相位名称*/
  private async showStageLabel() {
    if (!this.stageLabelLayer) {
      await this.createLabelLayer();
    }
  }

  private async createLabelLayer() {
    if (!this.crossBoxConfig) {
      const response = await fetch(
        this.appConfig.viewerUrl + "/app/Widgets/CrossBox/config.json"
      );
      this.crossBoxConfig = await response.json();
    }

    let labelLayerUrl: string = this.crossBoxConfig.layers.stateLabel;
    labelLayerUrl = labelLayerUrl.replace(
      /{gisServer}/i,
      this.appConfig.map.gisServer
    );
    this.stageLabelLayer = new FeatureLayer({
      url: labelLayerUrl
    });
    this.map.add(this.stageLabelLayer);
    return this.stageLabelLayer.when();
  }
}
