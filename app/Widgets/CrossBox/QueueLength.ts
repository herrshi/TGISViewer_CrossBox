import Map = require("esri/Map");
import Query = require("esri/tasks/support/Query");
import FeatureSet = require("esri/tasks/support/FeatureSet");
import Graphic = require("esri/Graphic");
import geometryEngine = require("esri/geometry/geometryEngine");
import Point = require("esri/geometry/Point");
import Polygon = require("esri/geometry/Polygon");
import Polyline = require("esri/geometry/Polyline");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import FeatureLayer = require("esri/layers/FeatureLayer");
import webMercatorUtils = require("esri/geometry/support/webMercatorUtils");
import WebStyleSymbol = require("esri/symbols/WebStyleSymbol");
import PointSymbol3D = require("esri/symbols/PointSymbol3D");
import ObjectSymbol3DLayer = require("esri/symbols/ObjectSymbol3DLayer");

import MapManager from "app/Managers/MapManager";
import GeometryUtils from "app/GeometryUtils/GeometryUtils";
import ConfigManager from "app/Managers/ConfigManager";

export default class QueueLength {
  private static instance: QueueLength;

  static getInstance(): QueueLength {
    if (!this.instance) {
      this.instance = new QueueLength();
    }

    return this.instance;
  }

  private map: Map;

  private crossBoxConfig: any;

  //车道线数据
  private laneLines: { id: string; line: Polyline }[];
  //车道中心线
  private laneCenterLines: { id: string; line: Polyline }[] = [];

  private readonly graphicsLayer: GraphicsLayer;

  constructor() {
    this.map = MapManager.getInstance().map;

    this.graphicsLayer = new GraphicsLayer();
    this.map.add(this.graphicsLayer);
  }

  public async setQueueLength(queueDatas: Array<QueueData>) {
    if (!this.laneLines) {
      await this.queryAllLaneLines();
    }

    this.graphicsLayer.removeAll();

    queueDatas.forEach(async queueData => {
      const { laneId, queueLength } = queueData;

      const queuePolygon: Polygon = await this.getQueuePolygon(
        laneId,
        queueLength
      );
      if (queuePolygon) {
        // await this.addQueueGraphic(queuePolygon, queueData);
        await this.placeRandomVehicles(queueData);
      }
    });
  }

  /**将polygon符号化以后加到地图中*/
  private async addQueueGraphic(polygon: Polygon, queueData: QueueData) {
    const { fillColor, edgeColor } = QueueLength.getColor(
      queueData.queueLength
    );
    const queueSymbol = {
      type: "polygon-3d", // autocasts as new PolygonSymbol3D()
      symbolLayers: [
        {
          type: "fill", // autocasts as new FillSymbol3DLayer()
          material: { color: fillColor },
          outline: { color: edgeColor }
        }
      ]
    };
    const queueGraphic: Graphic = new Graphic({
      geometry: polygon,
      symbol: queueSymbol,
      attributes: queueData
    });
    this.graphicsLayer.add(queueGraphic);
  }

  /**
   * 根据车道的两条边线，生成能贴合车道并能反映排队长度的面
   * */
  private async getQueuePolygon(laneId: string, queueLength: number) {
    const laneInfo: Array<string> = laneId.split("-");
    const [crossId, laneDir, laneIndex] = laneInfo;
    const laneLineIndex1: number = Number(laneIndex) - 1;
    const laneLineIndex2: number = Number(laneIndex);
    const laneLineId1: string =
      crossId + "-" + laneDir + "-00" + laneLineIndex1;
    const laneLineId2: string =
      crossId + "-" + laneDir + "-00" + laneLineIndex2;
    const laneLine1: Polyline = this.getLaneLine(laneLineId1);
    const laneLine2: Polyline = this.getLaneLine(laneLineId2);
    if (laneLine1 && laneLine2) {
      const queuePath1 = await GeometryUtils.clipPolylineInLength(
        laneLine1.paths[0],
        queueLength
      );
      const queuePath2 = await GeometryUtils.clipPolylineInLength(
        laneLine2.paths[0],
        queueLength
      );

      await this.extractCentreLine(laneId, laneLine1, laneLine2);

      //将两条path组合连接成ring
      const ring: Array<Array<number>> = queuePath1.concat(
        queuePath2.reverse()
      );
      //ring的终点必须和起点重合
      ring.push(queuePath1[0]);
      return new Polygon({
        rings: [ring]
      });
    }
  }

  /**
   * 按照排队长度，在车道上放置随机车辆
   * */
  private async placeRandomVehicles(queueData: QueueData) {
    let line: Polyline;
    for (let i = 0; i < this.laneCenterLines.length; i++) {
      if (this.laneCenterLines[i].id === queueData.laneId) {
        line = this.laneCenterLines[i].line;
        break;
      }
    }

    //前车尾部到停车线的距离
    let frontVehicleDistance: number = 0;
    //当前车辆位于
    while (frontVehicleDistance < queueData.queueLength) {
      const vehicleSymbol: PointSymbol3D = await this.getRandomVehicleSymbol();
      const vehicleLength: number = (vehicleSymbol.symbolLayers.getItemAt(
        0
      ) as ObjectSymbol3DLayer).depth;
      const path = await GeometryUtils.clipPolylineInLength(
        line.paths[0],
        frontVehicleDistance + vehicleLength / 2 + 1
      );
      const [x, y] = path[path.length - 1];
      const vehiclePoint: Point = new Point({
        x: x,
        y: y
      });
      QueueLength.setVehicleSymbolHeading(vehicleSymbol, line.getPoint(0, 0), vehiclePoint);
      const vehicleGraphic: Graphic = new Graphic({
        geometry: vehiclePoint,
        symbol: vehicleSymbol
      });
      this.graphicsLayer.add(vehicleGraphic);

      frontVehicleDistance += (vehicleLength + 1);
    }

    // let pt1: Point = line.getPoint(0, 0);
    // let pt2: Point = line.getPoint(0, 1);
    // const vehicleSymbol: PointSymbol3D = await this.getRandomVehicleSymbol();
    // QueueLength.setVehicleSymbolHeading(vehicleSymbol, pt1, pt2);
    // const vehicleLength: number = (vehicleSymbol.symbolLayers.getItemAt(
    //   0
    // ) as ObjectSymbol3DLayer).depth;
    // const path = await GeometryUtils.clipPolylineInLength(
    //   line.paths[0],
    //   vehicleLength / 2
    // );
    // const [x, y] = path[path.length - 1];
    // const vehiclePoint: Point = new Point({
    //   x: x,
    //   y: y
    // });
    // const vehicleGraphic: Graphic = new Graphic({
    //   geometry: vehiclePoint,
    //   symbol: vehicleSymbol
    // });
    // this.graphicsLayer.add(vehicleGraphic);
  }

  //获取两条车道线的中线
  private extractCentreLine(
    id: string,
    laneLine1: Polyline,
    laneLine2: Polyline
  ) {
    const lineObjs = this.laneCenterLines.filter(function(lineObj) {
      return lineObj.id === id;
    });
    if (lineObjs.length > 0) {
      return lineObjs[0].line;
    }

    //将两条车道线的起点连线，以计算车道宽度
    const path: Array<Array<number>> = [
      laneLine1.paths[0][0],
      laneLine2.paths[0][0]
    ];
    const line: Polyline = new Polyline({
      paths: [path]
    });
    //offset需要geometry和offsetUnit单位一致，所以转到墨卡托投影
    const projectedLine = webMercatorUtils.geographicToWebMercator(laneLine1);
    const distance: number = geometryEngine.geodesicLength(line, "meters");
    const offsetLength: number = distance / 2;
    const offsetLine: Polyline = geometryEngine.offset(
      projectedLine,
      -offsetLength,
      "meters",
      "miter"
    ) as Polyline;
    const geographicLine: Polyline = webMercatorUtils.webMercatorToGeographic(
      offsetLine
    ) as Polyline;
    this.laneCenterLines.push({ id: id, line: geographicLine });
    return offsetLine;
  }

  /**根据排队长度生成填充颜色*/
  private static getColor(queueLength: number) {
    return queueLength <= 10
      ? { fillColor: [100, 210, 122, 0.4], edgeColor: [37, 129, 55, 1] }
      : queueLength <= 20
        ? { fillColor: [250, 207, 51, 0.6], edgeColor: [204, 159, 4, 1] }
        : { fillColor: [172, 0, 0, 0.8], edgeColor: [91, 0, 0, 1] };
  }

  /**从车道服务中查询出所有车道的polyline*/
  private async queryAllLaneLines() {
    const response = await fetch(ConfigManager.getInstance().appConfig.viewerUrl + "/app/Widgets/CrossBox/config.json");
    this.crossBoxConfig = await response.json();
    let laneLayerUrl: string = this.crossBoxConfig.layers.lane;
    // const configManager: ConfigManager = ConfigManager.getInstance();
    laneLayerUrl = laneLayerUrl.replace(
      /{gisServer}/i,
      ConfigManager.getInstance().appConfig.map.gisServer
    );
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

  //根据id获取车道线
  private getLaneLine(id: string): Polyline {
    let line: Polyline;
    this.laneLines.forEach(laneLineObj => {
      if (laneLineObj.id === id) {
        line = laneLineObj.line;
      }
    });

    return line;
  }

  private async getRandomVehicleSymbol() {
    const vehicleSymbols: { name: string; styleName: string }[] = this
      .crossBoxConfig.vehicleSymbols;
    const random: number = Math.round(
      Math.random() * (vehicleSymbols.length - 1)
    );
    const originalSymbol: WebStyleSymbol = new WebStyleSymbol(
      vehicleSymbols[random]
    );
    return await originalSymbol.fetchSymbol();
  }

  //设置车辆模型的车头朝向
  private static setVehicleSymbolHeading(symbol: PointSymbol3D, pt1: Point, pt2: Point) {
    pt1 = webMercatorUtils.geographicToWebMercator(pt1) as Point;
    pt2 = webMercatorUtils.geographicToWebMercator(pt2) as Point;
    let objectSymbolLayer: ObjectSymbol3DLayer = (symbol.symbolLayers.getItemAt(
      0
    ) as ObjectSymbol3DLayer).clone();
    objectSymbolLayer.heading = QueueLength.calculateAngle(pt1, pt2);
    symbol.symbolLayers.removeAll();
    symbol.symbolLayers.add(objectSymbolLayer);
  }

  private static calculateAngle(pt1: Point, pt2: Point) {
    let radian: number = Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x);
    radian = radian - Math.PI / 2;
    let degrees: number;
    if (radian > 0) {
      degrees = 360 - (radian * 360) / (2 * Math.PI);
    } else {
      degrees = 360 - ((2 * Math.PI + radian) * 360) / (2 * Math.PI);
    }
    //车道线的方向是从停车线开始指向后方，和行车方向相反，需要偏转180度
    degrees += 180;
    if (degrees > 360) {
      degrees -= 360;
    }
    return degrees;
  }
}
