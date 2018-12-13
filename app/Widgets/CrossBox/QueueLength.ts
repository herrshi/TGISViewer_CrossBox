import FeatureLayer = require("esri/layers/FeatureLayer");
import Query = require("esri/tasks/support/Query");
import FeatureSet = require("esri/tasks/support/FeatureSet");
import Graphic = require("esri/Graphic");
import Polygon = require("esri/geometry/Polygon");
import Polyline = require("esri/geometry/Polyline");
import GraphicsLayer = require("esri/layers/GraphicsLayer");

import MapManager from "app/Managers/MapManager";
import GeometryUtils from "app/GeometryUtils/GeometryUtils";


export default class QueueLength {
  private static instance: QueueLength;

  //车道线数据
  private laneLines: Array<any>;

  private graphicsLayer: GraphicsLayer;

  constructor() {
    this.graphicsLayer = new GraphicsLayer();
    const mapManager: MapManager = MapManager.getInstance();
    mapManager.map.add(this.graphicsLayer);
  }

  public async setQueueLength(queueDatas: Array<QueueData>) {
    console.log(queueDatas);
    if (!this.laneLines) {
      await this.getLaneLines();
    }

    queueDatas.forEach(async queueData => {
      const {laneId, queueLength} = queueData;

      const laneInfo: Array<string> = laneId.split("-");
      const [crossId, laneDir, laneIndex] = laneInfo;
      const laneLineIndex1: number = Number(laneIndex)  - 1;
      const laneLineIndex2: number = Number(laneIndex);
      const laneLineId1: string = crossId + "-" + laneDir + "-00" + laneLineIndex1;
      const laneLineId2: string = crossId + "-" + laneDir + "-00" + laneLineIndex2;
      const laneLine1: Polyline = this.getLaneLine(laneLineId1);
      const laneLine2: Polyline = this.getLaneLine(laneLineId2);

      const queuePath1: Array<Array<number>> = await GeometryUtils.clipPolylineInLength(laneLine1.paths[0], queueLength);
      const queuePath2: Array<Array<number>> = await GeometryUtils.clipPolylineInLength(laneLine2.paths[0], queueLength);
      const ring: Array<Array<number>> = queuePath1.concat(queuePath2.reverse());
      ring.push(queuePath1[0]);
      const queuePolygon: Polygon = new Polygon({
        rings: [ring]
      });
      const fillSymbol = {
        type: "simple-fill", // autocasts as new SimpleFillSymbol()
        color: queueLength <= 10 ? [0, 255, 0, 0.8] : [255, 0, 0, 0.8],
        outline: { // autocasts as new SimpleLineSymbol()
          color: [255, 255, 255],
          width: 1
        }
      };
      const queueGraphic: Graphic = new Graphic({
        geometry: queuePolygon,
        symbol: fillSymbol
      });
      this.graphicsLayer.add(queueGraphic);



    });
  }

  /**从车道服务中查询出所有车道的polyline*/
  private async getLaneLines() {
    const response = await fetch("app/Widgets/CrossBox/config.json");
    const crossBoxConfig = await response.json();
    const laneLayerUrl: string = crossBoxConfig.layers.lane;
    const laneLayer: FeatureLayer = new FeatureLayer({
      url: laneLayerUrl
    });
    const query: Query = laneLayer.createQuery();
    const laneFeatureSet: FeatureSet = await laneLayer.queryFeatures(query);
    this.laneLines = laneFeatureSet.features.map((laneGraphic: Graphic) => {
      const id: string = laneGraphic.attributes.FEATUREID;
      const line: Polyline = laneGraphic.geometry as Polyline;
      return { id: id, line: line };
    });
  }

  private getLaneLine(id: string): Polyline {
    let line;
    this.laneLines.forEach(laneLineObj => {
      if (laneLineObj.id === id) {
        line = laneLineObj.line;
      }
    });

    return line;
  }

  static getInstance(): QueueLength {
    if (!this.instance) {
      this.instance = new QueueLength();
    }

    return this.instance;
  }
}
