import FeatureLayer = require("esri/layers/FeatureLayer");
import Graphic = require("esri/Graphic");
import Point = require("esri/geometry/Point");
import SimpleRenderer = require("esri/renderers/SimpleRenderer");
import LabelClass = require("esri/layers/support/LabelClass");
import LabelSymbol3D = require("esri/symbols/LabelSymbol3D");
import TextSymbol3DLayer = require("esri/symbols/TextSymbol3DLayer");
import WebStyleSymbol = require("esri/symbols/WebStyleSymbol");
import LineCallout3D = require("esri/symbols/callouts/LineCallout3D");

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
        x: 121.4246,
        y: 31.159291
      }),
      attributes: {
        ObjectID: 23,
        queueLength: "沪AT8888"
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
          type: "string"
        }
      ],
      objectIdField: "ObjectID",
      renderer: new SimpleRenderer({
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
            expression: "$feature.queueLength"
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
                size: 20
              })
            ],
            verticalOffset: {
              screenLength: 100,
              maxWorldLength: 2000,
              minWorldLength: 5
            },
            callout: new LineCallout3D({
              size: 1,
              color: [255, 255, 255]
            })
          })
        })
      ]
    });
    mapManager.map.add(this.labelLayer);
  }
}
