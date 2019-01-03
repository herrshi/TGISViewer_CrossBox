import Map = require("esri/Map");
import Graphic = require("esri/Graphic");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import QueryTask = require("esri/tasks/QueryTask");
import Query = require("esri/tasks/support/Query");
import FeatureSet = require("esri/tasks/support/FeatureSet");
import PointSymbol3D = require("esri/symbols/PointSymbol3D");
import ObjectSymbol3DLayer = require("esri/symbols/ObjectSymbol3DLayer");

import MapManager from "app/Managers/MapManager";
import ConfigManager from "app/Managers/ConfigManager";

export default class SignalLamp {
  private static instance: SignalLamp;

  static getInstance(): SignalLamp {
    if (!this.instance) {
      this.instance = new SignalLamp();
    }

    return this.instance;
  }

  readonly signalLampLayer: GraphicsLayer;

  private map: Map;

  private appConfig: any;

  constructor() {
    this.map = MapManager.getInstance().map;
    this.appConfig = ConfigManager.getInstance().appConfig;

    this.signalLampLayer = new GraphicsLayer();
    this.map.add(this.signalLampLayer);
  }

  public async showSignalLamps() {
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
      graphic.attributes.normal = true;

      //根据信号灯类型用不同的symbol
      let symbol: PointSymbol3D = new PointSymbol3D();
      if (lampAppClass === "4") {
        //行人信号灯
        const objectSymbol3DLayer: ObjectSymbol3DLayer = new ObjectSymbol3DLayer(
          {
            width: 0.7,
            height: 10.2,
            depth: 1.2,
            heading: symbolHeading,
            resource: {
              href:
                this.appConfig.viewerUrl +
                "/app/assets/model/Traffic_Light_3.glb"
            }
          }
        );
        symbol.symbolLayers.add(objectSymbol3DLayer);
      } else {
        //车行信号灯
        const objectSymbol3DLayer: ObjectSymbol3DLayer = new ObjectSymbol3DLayer(
          {
            width: 0.7,
            height: 18,
            depth: 13.58,
            heading: symbolHeading,
            material: undefined,
            resource: {
              href:
                this.appConfig.viewerUrl +
                "/app/assets/model/Traffic_Light_2.glb"
            }
          }
        );
        symbol.symbolLayers.add(objectSymbol3DLayer);
      }
      graphic.symbol = symbol;
      this.signalLampLayer.add(graphic);
    });

    await this.updateSignalLampSymbol();
  }

  private async getSignalLampState() {
    const response = await fetch(
      this.appConfig.viewerUrl + "/app/Widgets/CrossBox/RBX_RT_LAMP_XHDZT.json"
    );
    return await response.json();
  }

  private async updateSignalLampSymbol() {
    const lampStates: any[] = await this.getSignalLampState();
    this.signalLampLayer.graphics.forEach(lampGraphic => {
      //地图上一个机动车灯模型包含多个信号灯
      //模型id: 设备代码-信号灯编号1|信号灯编号2|, ..., |信号灯编号n
      //有一个信号灯状态异常就用红色
      const featureId: string = lampGraphic.attributes.FEATUREID;
      const featureIdArray = featureId.split("-");
      const SBBH: string = featureIdArray[0];
      const lampId: string = featureIdArray[1];
      const lampIds: string[] = lampId.split("|");
      let normal = true;
      lampIds.forEach(lampId => {
        for (let i = 0; i < lampStates.length; i++) {
          if (
            lampStates[i].sbbh === SBBH &&
            String(lampStates[i].xhdbh) === lampId &&
            (lampStates[i].xhdtxzt != 1 || lampStates[i].xhdgzzt != 1)
          ) {
            normal = false;
            break;
          }
        }
      });

      //设置红色
      if (!normal) {

      }
    });
  }
}
