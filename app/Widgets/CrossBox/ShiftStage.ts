import Map = require("esri/Map");
import Graphic = require("esri/Graphic");
import Point = require("esri/geometry/Point");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import MapImageLayer = require("esri/layers/MapImageLayer");
import QueryTask = require("esri/tasks/QueryTask");
import Query = require("esri/tasks/support/Query");
import FeatureSet = require("esri/tasks/support/FeatureSet");
import PictureMarkerSymbol = require("esri/symbols/PictureMarkerSymbol");
import WebStyleSymbol = require("esri/symbols/WebStyleSymbol");
import PointSymbol3D = require("esri/symbols/PointSymbol3D");
import ObjectSymbol3DLayer = require("esri/symbols/ObjectSymbol3DLayer");

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
  //信号灯Graphic
  private signalLampGraphic: Array<Graphic>;
  readonly signalLampLayer: GraphicsLayer;
  //车行灯高度
  private readonly CAR_LAMP_HEIGHT = 10;
  //人行灯高度
  private readonly MAN_LAMP_HEIGHT = 5;

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

    if (!this.signalLampGraphic) {
      await this.getSignalLamps();
    }
    // this.showSignalLampStage(stage);
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

  private async getSignalLamps() {
    //信号灯图层地址
    const response = await fetch(
      this.appConfig.viewerUrl + "/app/Widgets/CrossBox/config.json"
    );
    const crossBoxConfig = await response.json();
    let signalLampLayerUrl: string = crossBoxConfig.layers.signalLamp;
    signalLampLayerUrl = signalLampLayerUrl.replace(
      /{gisServer}/i,
      ConfigManager.getInstance().appConfig.map.gisServer
    );

    //查询信号灯点位
    const queryTask: QueryTask = new QueryTask({
      url: signalLampLayerUrl
    });
    const query: Query = new Query();
    query.returnGeometry = true;
    query.outFields = ["*"];
    query.where = "1=1";
    const results: FeatureSet = await queryTask.execute(query);
    results.features.forEach(async (graphic: Graphic) => {
      // const lampClass: string = graphic.attributes.LAMPCLASS;
      const lampAppClass: string = graphic.attributes.LAMPAPPCLASS;
      const symbolHeading: number = graphic.attributes.HEADING;
      if (lampAppClass === "4") {
        const symbol: WebStyleSymbol = new WebStyleSymbol({
          name: "Traffic_Light_3",
          styleName: "EsriRealisticSignsandSignalsStyle"
        });
        let walkSignalLampSymbol: PointSymbol3D = await symbol.fetchSymbol();
        let objectSymbolLayer: ObjectSymbol3DLayer = (walkSignalLampSymbol.symbolLayers.getItemAt(
          0
        ) as ObjectSymbol3DLayer).clone();
        // objectSymbolLayer.material = {color: "white"};
        objectSymbolLayer.height *= 3;
        objectSymbolLayer.width *= 2;
        objectSymbolLayer.depth *= 2;
        objectSymbolLayer.heading = symbolHeading;
        walkSignalLampSymbol.symbolLayers.removeAll();
        walkSignalLampSymbol.symbolLayers.add(objectSymbolLayer);
        graphic.symbol = walkSignalLampSymbol;
      } else {
        const symbol: WebStyleSymbol = new WebStyleSymbol({
          name: "Traffic_Light_2",
          styleName: "EsriRealisticSignsandSignalsStyle"
        });
        let carSignalLampSymbol: PointSymbol3D = await symbol.fetchSymbol();
        let objectSymbolLayer: ObjectSymbol3DLayer = (carSignalLampSymbol.symbolLayers.getItemAt(
          0
        ) as ObjectSymbol3DLayer).clone();
        // objectSymbolLayer.material = {color: "white"};
        objectSymbolLayer.height *= 2;
        objectSymbolLayer.width *= 2;
        objectSymbolLayer.depth *= 2;
        objectSymbolLayer.heading = symbolHeading;
        carSignalLampSymbol.symbolLayers.removeAll();
        carSignalLampSymbol.symbolLayers.add(objectSymbolLayer);
        graphic.symbol = carSignalLampSymbol;
      }
      this.signalLampLayer.add(graphic);
      return graphic;
    });
  }

  private showSignalLampStage(stage: string) {
    this.signalLampGraphic.forEach((graphic: Graphic) => {
      const lampAppClass: string = graphic.attributes.LAMPAPPCLASS;
      const greenStage: string = graphic.attributes.GREENSTAGE;
      let picUrl: string;
      let picWidth: string;
      let picHeight: string;
      switch (lampAppClass) {
        case "1":
          //机动车信号灯
          if (greenStage.indexOf(stage) >= 0) {
            picUrl = "/app/images/point_green.png";
          } else {
            picUrl = "/app/images/point_red.png";
          }
          picHeight = picWidth = "72px";
          break;

        case "4":
          //人行横道信号灯
          if (greenStage.indexOf(stage) >= 0) {
            picUrl = "/app/images/Man_green.png";
          } else {
            picUrl = "/app/images/Man_red.png";
          }
          picHeight = picWidth = "36px";
          break;

        case "6":
          //左转机动车信号灯
          if (greenStage.indexOf(stage) >= 0) {
            picUrl = "/app/images/TurnLeft_green.png";
          } else {
            picUrl = "/app/images/TurnLeft_red.png";
          }
          picHeight = picWidth = "72px";
          break;
      }

      graphic.symbol = new PictureMarkerSymbol({
        url: this.appConfig.viewerUrl + picUrl,
        width: picWidth,
        height: picHeight
      });
      this.signalLampLayer.add(graphic);
    });
  }
}
