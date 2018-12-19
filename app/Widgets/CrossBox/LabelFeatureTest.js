define(["require", "exports", "esri/layers/FeatureLayer", "esri/Graphic", "esri/geometry/Point", "esri/renderers/SimpleRenderer", "esri/layers/support/LabelClass", "esri/symbols/LabelSymbol3D", "esri/symbols/TextSymbol3DLayer", "esri/symbols/WebStyleSymbol", "esri/symbols/callouts/LineCallout3D", "app/Managers/MapManager"], function (require, exports, FeatureLayer, Graphic, Point, SimpleRenderer, LabelClass, LabelSymbol3D, TextSymbol3DLayer, WebStyleSymbol, LineCallout3D, MapManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LabelFeatureTest = /** @class */ (function () {
        function LabelFeatureTest() {
            this.LabelTest();
        }
        LabelFeatureTest.getInstance = function () {
            if (!this.instance) {
                this.instance = new LabelFeatureTest();
            }
            return this.instance;
        };
        LabelFeatureTest.prototype.LabelTest = function () {
            var graphic1 = new Graphic({
                geometry: new Point({
                    x: 121.4246,
                    y: 31.159291
                }),
                attributes: {
                    ObjectID: 23,
                    queueLength: "沪AT8888"
                }
            });
            var mapManager = MapManager_1.default.getInstance();
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
        };
        return LabelFeatureTest;
    }());
    exports.default = LabelFeatureTest;
});
//# sourceMappingURL=LabelFeatureTest.js.map