import Query = require("esri/tasks/support/Query");
import FeatureSet = require("esri/tasks/support/FeatureSet");
import Graphic = require("esri/Graphic");
import geometryEngine = require("esri/geometry/geometryEngine");
// import geometryEngineAsync = require("esri/geometry/geometryEngineAsync");
import Point = require("esri/geometry/Point");
import Polygon = require("esri/geometry/Polygon");
import Polyline = require("esri/geometry/Polyline");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import FeatureLayer = require("esri/layers/FeatureLayer");
import LabelClass = require("esri/layers/support/LabelClass");
import LabelSymbol3D = require("esri/symbols/LabelSymbol3D");
import TextSymbol3DLayer = require("esri/symbols/TextSymbol3DLayer");
import SimpleRenderer = require("esri/renderers/SimpleRenderer");
import webMercatorUtils = require("esri/geometry/support/webMercatorUtils");
import PointSymbol3D = require("esri/symbols/PointSymbol3D");
import IconSymbol3DLayer = require("esri/symbols/IconSymbol3DLayer");
import SimpleMarkerSymbol = require("esri/symbols/SimpleMarkerSymbol");
import SimpleLineSymbol = require("esri/symbols/SimpleLineSymbol");
import Map = require("esri/Map");
import LineCallout3D = require("esri/symbols/callouts/LineCallout3D");

import MapManager from "app/Managers/MapManager";
import GeometryUtils from "app/GeometryUtils/GeometryUtils";

export default class QueueLength {
  private static instance: QueueLength;

  static getInstance(): QueueLength {
    if (!this.instance) {
      this.instance = new QueueLength();
    }

    return this.instance;
  }

  private map: Map;

  //车道线数据
  private laneLines: { id: string; line: Polyline }[];
  //车道中心线
  private laneCenterLines: { id: string; line: Polyline }[] = [];
  //
  private labelGraphics: Graphic[];

  private readonly graphicsLayer: GraphicsLayer;
  private labelLayer: FeatureLayer;

  constructor() {
    const mapManager: MapManager = MapManager.getInstance();
    this.map = mapManager.map;

    this.graphicsLayer = new GraphicsLayer();
    this.map.add(this.graphicsLayer);
  }

  public async setQueueLength(queueDatas: Array<QueueData>) {
    if (!this.laneLines) {
      await this.queryAllLaneLines();
    }

    this.graphicsLayer.removeAll();
    this.labelGraphics = [];

    queueDatas.forEach(async queueData => {
      const { laneId, queueLength } = queueData;

      const queuePolygon: Polygon = await this.getQueuePolygon(
        laneId,
        queueLength
      );
      if (queuePolygon) {
        await this.addQueueGraphic(queuePolygon, queueData);
      }
    });
    // this.generateLabel();
  }

  /**将polygon符号化以后加到地图中*/
  private async addQueueGraphic(polygon: Polygon, queueData: QueueData) {
    const { fillColor, edgeColor } = QueueLength.getColor(
      queueData.queueLength
    );
    const fillSymbol3D = {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          material: {
            color: fillColor
          },
          edges: {
            type: "solid",
            color: edgeColor
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

    await this.splitLabelGraphic(queueData);
  }

  /**
   * 按字拆分graphic
   * sceneView中，polyline的标注无法沿线放置，所以在线上按字数取一系列点，给点加标注
   * */
  private async splitLabelGraphic(queueData: QueueData) {
    const lineData = this.laneCenterLines.filter(function(lineObj) {
      return lineObj.id === queueData.laneId;
    });
    if (lineData.length === 0) {
      return;
    }

    const centerLine: Polyline = lineData[0].line;
    const labelText: string = queueData.queueLength + "米";
    //每个字的距离
    const labelGap: number = 4;
    for (let i = 0; i < labelText.length; i++) {
      const clippedPath = await GeometryUtils.clipPolylineInLength(
        centerLine.paths[0],
        labelGap * (i + 1)
      );
      //每个字的标注点
      const labelPoint = clippedPath[clippedPath.length - 1];
      const graphic: Graphic = new Graphic({
        geometry: new Point({
          x: labelPoint[0],
          y: labelPoint[1]
        }),
        attributes: { ObjectID: queueData.laneId + i, text: labelText[i] }
      });
      this.labelGraphics.push(graphic);
    }
    // this.generateLabel();
  }

  private generateLabel() {
    if (this.labelLayer) {
      this.map.remove(this.labelLayer);
    }

    this.labelLayer = new FeatureLayer({
      source: this.labelGraphics,
      geometryType: "point",
      fields: [
        {
          name: "ObjectID",
          alias: "ObjectID",
          type: "oid"
        },
        {
          name: "text",
          alias: "text",
          type: "string"
        }
      ],
      objectIdField: "ObjectID",
      renderer: new SimpleRenderer({
        symbol: new SimpleMarkerSymbol({
          size: 0,
          color: "white"
        })
      }),
      outFields: ["*"],
      labelingInfo: [
        new LabelClass({
          labelPlacement: "above-center",
          labelExpressionInfo: {
            expression: "$feature.text"
          },
          symbol: new LabelSymbol3D({
            symbolLayers: [
              new TextSymbol3DLayer({
                material: {
                  color: "black"
                },
                halo: {
                  color: [255, 255, 255, 0.7],
                  size: 2
                },
                size: 10
              })
            ],
            verticalOffset: {
              screenLength: 20,
              minWorldLength: 4
            },
          })
        })
      ]
    });
    this.map.add(this.labelLayer);
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

      await this.extractCenterline(laneId, laneLine1, laneLine2);

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

  //获取两条车道线的中线，用于标注排队长度
  private extractCenterline(
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

  //根据id获取车道线
  private getLaneLine(id: string): Polyline {
    let line;
    this.laneLines.forEach(laneLineObj => {
      if (laneLineObj.id === id) {
        line = laneLineObj.line;
      }
    });

    return line;
  }
}
