import Map = require("esri/Map");
import Graphic = require("esri/Graphic");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import MapImageLayer = require("esri/layers/MapImageLayer");
import QueryTask = require("esri/tasks/QueryTask");
import Query = require("esri/tasks/support/Query");
import FeatureSet = require("esri/tasks/support/FeatureSet");
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
  readonly signalLampLayer: GraphicsLayer;

  private map: Map;

  private appConfig: any;

  constructor() {
    this.map = MapManager.getInstance().map;
    this.appConfig = ConfigManager.getInstance().appConfig;

    this.signalLampLayer = new GraphicsLayer();
    this.map.add(this.signalLampLayer);

    this.getSignalLamps();
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
      const lampAppClass: string = graphic.attributes.LAMPAPPCLASS;
      const symbolHeading: number = graphic.attributes.HEADING;

      //根据信号灯类型用不同的symbol
      let symbol: PointSymbol3D = new PointSymbol3D();
      if (lampAppClass === "4") {
        //行人信号灯
        const objectSymbol3DLayer: ObjectSymbol3DLayer = new ObjectSymbol3DLayer({
          width: 0.35263153076171877 * 2,
          height: 3.4637600708007814 * 3,
          depth: 0.6094674301147461 * 2,
          heading: symbolHeading,
          resource: {href: this.appConfig.viewerUrl + "/app/assets/model/Traffic_Light_3.glb"}
        });
        symbol.symbolLayers.add(objectSymbol3DLayer);
      } else {
        //车行信号灯
        const objectSymbol3DLayer: ObjectSymbol3DLayer = new ObjectSymbol3DLayer({
          width: 0.36740692138671877 * 2,
          height: 6.0284796142578125 * 3,
          depth: 6.792438163757324 * 2,
          heading: symbolHeading,
          resource: {href: this.appConfig.viewerUrl + "/app/assets/model/Traffic_Light_2.glb"}
        });
        symbol.symbolLayers.add(objectSymbol3DLayer);
      }
      graphic.symbol = symbol;
      this.signalLampLayer.add(graphic);
      // return graphic;
    });
  }


}
