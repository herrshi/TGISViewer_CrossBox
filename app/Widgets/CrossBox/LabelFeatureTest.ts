import FeatureLayer = require("esri/layers/FeatureLayer");
import Graphic = require("esri/Graphic");
import Point = require("esri/geometry/Point");
import SimpleRenderer = require("esri/renderers/SimpleRenderer");
import PointSymbol3D = require("esri/symbols/PointSymbol3D");
import IconSymbol3DLayer = require("esri/symbols/IconSymbol3DLayer");
import LabelClass = require("esri/layers/support/LabelClass");
import LabelSymbol3D = require("esri/symbols/LabelSymbol3D");
import TextSymbol3DLayer = require("esri/symbols/TextSymbol3DLayer");
import WebStyleSymbol = require("esri/symbols/WebStyleSymbol");

import MapManager from "app/Managers/MapManager";

export default class LabelFeatureTest {
  private static instance: LabelFeatureTest;

  public static getInstance(): LabelFeatureTest {
    if (!this.instance) {
      this.instance = new LabelFeatureTest();
    }
    return this.instance;
  }

  private labelLayer: FeatureLayer;

  constructor() {
    this.LabelTest();
  }

  private LabelTest() {
    const graphic1: Graphic = new Graphic({
      geometry: new Point({
        x: 121.429063,
        y: 31.157143
      }),
      attributes: {
        ObjectID: 23,
        queueLength: 23
      }
    });

    const mapManager: MapManager = MapManager.getInstance();
    if (this.labelLayer) {
      mapManager.map.remove(this.labelLayer);
    }
    this.labelLayer = new FeatureLayer({
      source: [graphic1],
      fields: [
        {
          name: "ObjectID",
          alias: "ObjectID",
          type: "oid"
        },
        {
          name: "queueLength",
          alias: "queueLength",
          type: "double"
        }
      ],
      objectIdField: "ObjectID",
      renderer: new SimpleRenderer({
        // symbol: new PointSymbol3D({
        //   symbolLayers: [
        //     new IconSymbol3DLayer({
        //       resource: {
        //         primitive: "circle"
        //       },
        //       material: {
        //         color: "white"
        //       },
        //       size: 10
        //     })
        //   ]
        // })
        symbol: new WebStyleSymbol({
          portal: {
            url: "https://www.arcgis.com"
          },
          styleName: "EsriRealisticTransportationStyle",
          name: "Bus"
        })
      }),
      outFields: ["*"],
      labelingInfo: [
        new LabelClass({
          labelPlacement: "above-center",
          labelExpressionInfo: {
            expression: "$feature.queueLength + '米'"
          },
          symbol: new LabelSymbol3D({
            symbolLayers: [
              new TextSymbol3DLayer({
                material: {
                  color: "red"
                },
                halo: {
                  color: [255, 255, 255, 0.7],
                  size: 2
                },
                size: 10
              })
            ],
            // verticalOffset: {
            //   screenLength: 150,
            //   maxWorldLength: 2000,
            //   minWorldLength: 30
            // },
            // callout: {
            //
            // }
          })
        })
      ]
    });
    mapManager.map.add(this.labelLayer);
  }
}
