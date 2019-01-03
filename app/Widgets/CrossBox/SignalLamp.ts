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
  private signalLampGraphics: Array<Graphic>;

  private map: Map;

  private appConfig: any;

  constructor() {
    this.map = MapManager.getInstance().map;
    this.appConfig = ConfigManager.getInstance().appConfig;

    this.signalLampLayer = new GraphicsLayer();
    this.map.add(this.signalLampLayer);
  }

  public async showSignalLamps() {
    this.signalLampGraphics = [];

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
      graphic.attributes.state = "normal";
      this.setSymbol(graphic);

      this.signalLampLayer.add(graphic);
      this.signalLampGraphics.push(graphic);
    });

    await this.updateSignalLampsSymbol();
  }

  private async getSignalLampState() {
    const response = await fetch(
      this.appConfig.viewerUrl + "/app/Widgets/CrossBox/RBX_RT_LAMP_XHDZT.json"
    );
    return await response.json();
  }

  private async updateSignalLampsSymbol() {
    const lampStates: any[] = await this.getSignalLampState();
    this.signalLampGraphics.forEach(lampGraphic => {
      //地图上一个机动车灯模型包含多个信号灯
      //模型id: 设备代码-信号灯编号1|信号灯编号2|, ..., |信号灯编号n
      //有一个信号灯状态异常就用红色
      const featureId: string = lampGraphic.attributes.FEATUREID;
      const featureIdArray = featureId.split("-");
      const SBBH: string = featureIdArray[0];
      const lampId: string = featureIdArray[1];
      const lampIds: string[] = lampId.split("|");
      let state = "normal";
      lampIds.forEach(lampId => {
        for (let i = 0; i < lampStates.length; i++) {
          if (
            lampStates[i].sbbh === SBBH &&
            String(lampStates[i].xhdbh) === lampId &&
            (lampStates[i].xhdtxzt != 1 || lampStates[i].xhdgzzt != 1)
          ) {
            state = "abnormal";
            break;
          }
        }
      });

      if (lampGraphic.attributes.state != state) {
        this.signalLampLayer.remove(lampGraphic);
        let newGraphic = lampGraphic.clone();
        newGraphic.attributes.state = state;
        this.setSymbol(newGraphic);
        this.signalLampLayer.add(newGraphic);

      }
    });
  }

  private setSymbol(graphic: Graphic) {
    //根据信号灯类型用不同的symbol
    let symbol: PointSymbol3D = new PointSymbol3D();
    if (graphic.attributes.LAMPAPPCLASS === "4") {
      //行人信号灯
      const objectSymbol3DLayer: ObjectSymbol3DLayer = new ObjectSymbol3DLayer(
        {
          width: 0.7,
          height: 10.2,
          depth: 1.2,
          heading: graphic.attributes.HEADING,
          material:
            graphic.attributes.state === "normal" ? undefined : { color: [235, 97, 228] },
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
          heading: graphic.attributes.HEADING,
          material:
            graphic.attributes.state === "normal" ? undefined : { color: "red" },
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
  }
}
