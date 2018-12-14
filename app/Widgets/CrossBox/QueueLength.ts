import Query = require("esri/tasks/support/Query");
import FeatureSet = require("esri/tasks/support/FeatureSet");
import Graphic = require("esri/Graphic");
import Polygon = require("esri/geometry/Polygon");
import Polyline = require("esri/geometry/Polyline");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import FeatureLayer = require("esri/layers/FeatureLayer");
import LabelClass = require("esri/layers/support/LabelClass");
import LabelSymbol3D = require("esri/symbols/LabelSymbol3D");
import TextSymbol3DLayer = require("esri/symbols/TextSymbol3DLayer");
import SimpleRenderer = require("esri/renderers/SimpleRenderer");



import MapManager from "app/Managers/MapManager";
import GeometryUtils from "app/GeometryUtils/GeometryUtils";

export default class QueueLength {
  private static instance: QueueLength;

  //车道线数据
  private laneLines: { id: string; line: Polyline }[];

  private readonly graphicsLayer: GraphicsLayer;
  private readonly textLayer: FeatureLayer;

  constructor() {
    this.graphicsLayer = new GraphicsLayer();
    const mapManager: MapManager = MapManager.getInstance();
    mapManager.map.add(this.graphicsLayer);

    const labelClass = new LabelClass({
      symbol: new LabelSymbol3D({
        symbolLayers: [new TextSymbol3DLayer({
          material: {
            color: "white"
          },
          size: 10
        })]
      }),
      labelPlacement: "above-right",
      labelExpressionInfo: {
        expression: "$feature.queueLength"
      }
    });
    const textSymbol = {
      type: "point-3d",  // autocasts as new PointSymbol3D()
      symbolLayers: [{
        type: "icon",  // autocasts as new IconSymbol3DLayer()
        size: 12,
        resource: {
          primitive: "square"
        },
        material: {
          color: "orange"
        },
        outline: {
          color: "white",
          size: 1
        }
      }]
    };
    const textRenderer = new SimpleRenderer({
      symbol: textSymbol
    });
    this.textLayer = new FeatureLayer({
      fields: [
        {
          name: "ObjectID",
          alias: "ObjectID",
          type: "oid"
        },
        {
          name: "laneId",
          alias: "车道编号",
          type: "string"
        },
        {
          name: "queueLength",
          alias: "排队长度",
          type: "double"
        }
      ],
      source: [],
      objectIdField: "ObjectID",
      labelingInfo: [labelClass],
      renderer: textRenderer
    });
    // mapManager.map.add(this.textLayer);
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
        // this.addQueueGraphic(queuePolygon, queueData);
        this.addQueueText(queuePolygon, queueData);
      }

    });
  }

  /**将polygon符号化以后加到地图中*/
  private addQueueGraphic(polygon: Polygon, queueData: QueueData) {
    const fillSymbol3D = {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          material: {
            color: QueueLength.getLaneColor(queueData.queueLength)
          },
          edges: {
            type: "solid",
            color: QueueLength.getEdgeColor(queueData.queueLength)
          },
          size: 3
        }
      ]
    };
    const queueGraphic: Graphic = new Graphic({
      geometry: polygon,
      symbol: fillSymbol3D,
      attributes: queueData
    });
    this.graphicsLayer.add(queueGraphic);
  }

  /**添加排队长度文字*/
  private addQueueText(polygon: Polygon, queueData: QueueData) {
    const textPoint = polygon.centroid;

    const textGraphic: Graphic = new Graphic({
      geometry: textPoint,
      attributes: queueData
    });
    this.textLayer.source.push(textGraphic);
    this.textLayer.refresh();
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
      //将两条path组合连接成ring
      const ring: Array<Array<number>> = queuePath1.concat(queuePath2.reverse());
      //ring的终点必须和起点重合
      ring.push(queuePath1[0]);
      return new Polygon({
        rings: [ring]
      });
    }

  }

  /**根据排队长度生成颜色*/
  private static getLaneColor(queueLength: number): Array<number> {
    return queueLength <= 10
      ? [100, 210, 122, 0.4]
      : queueLength <= 20
        ? [250, 207, 51, 0.6]
        : [172, 0, 0, 0.8];
  }

  private static getEdgeColor(queueLength: number): Array<number> {
    return queueLength <= 10
      ? [37, 129, 55, 1]
      : queueLength <= 20
        ? [204, 159, 4, 1]
        : [91, 0, 0, 1];
  }

  /**从车道服务中查询出所有车道的polyline*/
  private async queryAllLaneLines() {
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
