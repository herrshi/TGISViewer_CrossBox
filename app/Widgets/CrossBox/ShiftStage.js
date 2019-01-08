var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "esri/layers/MapImageLayer", "esri/layers/FeatureLayer", "esri/layers/support/LabelClass", "esri/symbols/LabelSymbol3D", "esri/symbols/TextSymbol3DLayer", "esri/renderers/SimpleRenderer", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/Font", "app/Managers/MapManager", "app/Managers/ConfigManager"], function (require, exports, MapImageLayer, FeatureLayer, LabelClass, LabelSymbol3D, TextSymbol3DLayer, SimpleRenderer, SimpleMarkerSymbol, Font, MapManager_1, ConfigManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ShiftStage = /** @class */ (function () {
        function ShiftStage() {
            this.map = MapManager_1.default.getInstance().map;
            this.appConfig = ConfigManager_1.default.getInstance().appConfig;
        }
        ShiftStage.getInstance = function () {
            if (!this.instance) {
                this.instance = new ShiftStage();
            }
            return this.instance;
        };
        ShiftStage.prototype.shiftStage = function (crossId, stage) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.showStageLabel(crossId, stage)];
                        case 1:
                            _a.sent();
                            if (!!this.stagesLayer) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.createStageLayer()];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            this.stagesLayer.findSublayerById(0).definitionExpression = "STAGES like '%" + stage + "%'";
                            this.stagesLayer.refresh();
                            return [2 /*return*/];
                    }
                });
            });
        };
        ShiftStage.prototype.createStageLayer = function () {
            return __awaiter(this, void 0, void 0, function () {
                var response, _a, stageLayerUrl;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!!this.crossBoxConfig) return [3 /*break*/, 3];
                            return [4 /*yield*/, fetch(this.appConfig.viewerUrl + "/app/Widgets/CrossBox/config.json")];
                        case 1:
                            response = _b.sent();
                            _a = this;
                            return [4 /*yield*/, response.json()];
                        case 2:
                            _a.crossBoxConfig = _b.sent();
                            _b.label = 3;
                        case 3:
                            stageLayerUrl = this.crossBoxConfig.layers.stage;
                            stageLayerUrl = stageLayerUrl.replace(/{gisServer}/i, this.appConfig.map.gisServer);
                            this.stagesLayer = new MapImageLayer({
                                url: stageLayerUrl
                            });
                            this.map.add(this.stagesLayer);
                            return [2 /*return*/, this.stagesLayer.when()];
                    }
                });
            });
        };
        /**在路口中心显示相位名称*/
        ShiftStage.prototype.showStageLabel = function (crossId, stage) {
            return __awaiter(this, void 0, void 0, function () {
                var crossGraphic;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!!this.stageLabelLayer) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.createLabelLayer()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            crossGraphic = this.stageLabelLayer.source.find(function (graphic) {
                                return graphic.attributes.FEATUREID === crossId;
                            });
                            if (crossGraphic) {
                                crossGraphic.attributes.stage = stage;
                                this.stageLabelLayer.applyEdits({
                                    updateFeatures: [crossGraphic]
                                });
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        ShiftStage.prototype.createLabelLayer = function () {
            return __awaiter(this, void 0, void 0, function () {
                var response, _a, labelClass, labelLayerUrl, sourceLayer, query, result, graphics;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!!this.crossBoxConfig) return [3 /*break*/, 3];
                            return [4 /*yield*/, fetch(this.appConfig.viewerUrl + "/app/Widgets/CrossBox/config.json")];
                        case 1:
                            response = _b.sent();
                            _a = this;
                            return [4 /*yield*/, response.json()];
                        case 2:
                            _a.crossBoxConfig = _b.sent();
                            _b.label = 3;
                        case 3:
                            labelClass = new LabelClass({
                                symbol: new LabelSymbol3D({
                                    symbolLayers: [
                                        new TextSymbol3DLayer({
                                            material: { color: [85, 255, 0] },
                                            size: "18px",
                                            font: new Font({
                                                weight: "bold",
                                                family: "微软雅黑"
                                            })
                                        })
                                    ]
                                }),
                                labelExpressionInfo: {
                                    expression: "$feature.stage + '相位'"
                                },
                                labelPlacement: "above-center"
                            });
                            labelLayerUrl = this.crossBoxConfig.layers.stageLabel;
                            labelLayerUrl = labelLayerUrl.replace(/{gisServer}/i, this.appConfig.map.gisServer);
                            sourceLayer = new FeatureLayer({
                                url: labelLayerUrl
                            });
                            query = sourceLayer.createQuery();
                            query.outFields = ["*"];
                            return [4 /*yield*/, sourceLayer.queryFeatures(query)];
                        case 4:
                            result = _b.sent();
                            graphics = result.features;
                            //给所有路口点加上stage属性
                            graphics.forEach(function (graphic) {
                                graphic.attributes.stage = "";
                            });
                            this.stageLabelLayer = new FeatureLayer({
                                source: graphics,
                                objectIdField: "OBJECTID",
                                fields: [
                                    {
                                        name: "OBJECTID",
                                        alias: "OBJECTID",
                                        type: "oid"
                                    },
                                    {
                                        name: "FEATUREID",
                                        alias: "FEATUREID",
                                        type: "string"
                                    },
                                    {
                                        name: "FEATURENAME",
                                        alias: "FEATURENAME",
                                        type: "string"
                                    },
                                    {
                                        name: "FEATURETYPE",
                                        alias: "FEATURETYPE",
                                        type: "string"
                                    },
                                    {
                                        name: "stage",
                                        alias: "stage",
                                        type: "string"
                                    }
                                ],
                                renderer: new SimpleRenderer({
                                    symbol: new SimpleMarkerSymbol({
                                        style: "circle",
                                        size: 0
                                    })
                                }),
                                outFields: ["*"],
                                labelingInfo: [labelClass]
                            });
                            this.map.add(this.stageLabelLayer);
                            return [2 /*return*/];
                    }
                });
            });
        };
        return ShiftStage;
    }());
    exports.default = ShiftStage;
});
//# sourceMappingURL=ShiftStage.js.map