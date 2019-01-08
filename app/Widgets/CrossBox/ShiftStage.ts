import Map = require("esri/Map");
import Graphic = require("esri/Graphic");
import MapImageLayer = require("esri/layers/MapImageLayer");
import FeatureLayer = require("esri/layers/FeatureLayer");
import Query = require("esri/tasks/support/Query");
import FeatureSet = require("esri/tasks/support/FeatureSet");
import LabelClass = require("esri/layers/support/LabelClass");
import LabelSymbol3D = require("esri/symbols/LabelSymbol3D");
import TextSymbol3DLayer = require("esri/symbols/TextSymbol3DLayer");
import SimpleRenderer = require("esri/renderers/SimpleRenderer");
import SimpleMarkerSymbol = require("esri/symbols/SimpleMarkerSymbol");
import Font = require("esri/symbols/Font");

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
    await this.showStageLabel(crossId, stage);

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

  /**在路口中心显示相位名称*/
  private async showStageLabel(crossId: string, stage: string) {
    if (!this.stageLabelLayer) {
      await this.createLabelLayer();
    }

    const crossGraphic: Graphic = this.stageLabelLayer.source.find(graphic => {
      return graphic.attributes.FEATUREID === crossId;
    });
    if (crossGraphic) {
      crossGraphic.attributes.stage = stage;
      this.stageLabelLayer.applyEdits({
        updateFeatures: [crossGraphic]
      });
    }
  }

  private async createLabelLayer() {
    if (!this.crossBoxConfig) {
      const response = await fetch(
        this.appConfig.viewerUrl + "/app/Widgets/CrossBox/config.json"
      );
      this.crossBoxConfig = await response.json();
    }

    const labelClass: LabelClass = new LabelClass({
      symbol: new LabelSymbol3D({
        symbolLayers: [
          new TextSymbol3DLayer({
            material: { color: [85, 255, 0] },
            size: "18px",
            font: new Font({
              weight: "bold",
              family: "微软雅黑"
            })
          })
        ]
      }),
      labelExpressionInfo: {
        expression: "$feature.stage + '相位'"
      },
      labelPlacement: "above-center"
    });

    //从服务中获取路口中心点点位，在graphic.attributes中加上当前相位属性，从source创建新的FeatureLayer
    //相位需要实时更新，需要使用FeatureLayer.applyEdits
    //FeatureLayer.applyEdits只能用于sde或者在客户端从source创建的FeatureLayer
    let labelLayerUrl: string = this.crossBoxConfig.layers.stageLabel;
    labelLayerUrl = labelLayerUrl.replace(
      /{gisServer}/i,
      this.appConfig.map.gisServer
    );
    const sourceLayer: FeatureLayer = new FeatureLayer({
      url: labelLayerUrl
    });
    const query: Query = sourceLayer.createQuery();
    query.outFields = ["*"];
    const result: FeatureSet = await sourceLayer.queryFeatures(query);
    const graphics: Array<Graphic> = result.features;
    //给所有路口点加上stage属性
    graphics.forEach(graphic => {
      graphic.attributes.stage = "";
    });
    this.stageLabelLayer = new FeatureLayer({
      source: graphics,
      objectIdField: "OBJECTID",
      fields: [
        {
          name: "OBJECTID",
          alias: "OBJECTID",
          type: "oid"
        },
        {
          name: "FEATUREID",
          alias: "FEATUREID",
          type: "string"
        },
        {
          name: "FEATURENAME",
          alias: "FEATURENAME",
          type: "string"
        },
        {
          name: "FEATURETYPE",
          alias: "FEATURETYPE",
          type: "string"
        },
        {
          name: "stage",
          alias: "stage",
          type: "string"
        }
      ],
      renderer: new SimpleRenderer({
        symbol: new SimpleMarkerSymbol({
          style: "circle",
          size: 0
        })
      }),
      outFields: ["*"],
      labelingInfo: [labelClass]
    });
    this.map.add(this.stageLabelLayer);
  }
}
