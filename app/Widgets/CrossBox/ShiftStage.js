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
define(["require", "exports", "esri/layers/GraphicsLayer", "esri/layers/MapImageLayer", "esri/tasks/QueryTask", "esri/tasks/support/Query", "esri/symbols/PictureMarkerSymbol", "esri/symbols/WebStyleSymbol", "app/Managers/MapManager", "app/Managers/ConfigManager"], function (require, exports, GraphicsLayer, MapImageLayer, QueryTask, Query, PictureMarkerSymbol, WebStyleSymbol, MapManager_1, ConfigManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ShiftStage = /** @class */ (function () {
        function ShiftStage() {
            //车行灯高度
            this.CAR_LAMP_HEIGHT = 10;
            //人行灯高度
            this.MAN_LAMP_HEIGHT = 5;
            this.map = MapManager_1.default.getInstance().map;
            this.appConfig = ConfigManager_1.default.getInstance().appConfig;
            this.signalLampLayer = new GraphicsLayer();
            this.map.add(this.signalLampLayer);
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
                        case 0:
                            if (!!this.stagesLayer) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.createStageLayer()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            this.stagesLayer.findSublayerById(0).definitionExpression = "STAGES like '%" + stage + "%'";
                            this.stagesLayer.refresh();
                            if (!!this.signalLampGraphic) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.getSignalLamps()];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        ShiftStage.prototype.createStageLayer = function () {
            return __awaiter(this, void 0, void 0, function () {
                var response, crossBoxConfig, stageLayerUrl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch(this.appConfig.viewerUrl + "/app/Widgets/CrossBox/config.json")];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            crossBoxConfig = _a.sent();
                            stageLayerUrl = crossBoxConfig.layers.stage;
                            stageLayerUrl = stageLayerUrl.replace(/{gisServer}/i, ConfigManager_1.default.getInstance().appConfig.map.gisServer);
                            this.stagesLayer = new MapImageLayer({
                                url: stageLayerUrl
                            });
                            this.map.add(this.stagesLayer);
                            return [2 /*return*/, this.stagesLayer.when()];
                    }
                });
            });
        };
        ShiftStage.prototype.getSignalLamps = function () {
            return __awaiter(this, void 0, void 0, function () {
                var response, crossBoxConfig, signalLampLayerUrl, queryTask, query, results;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch(this.appConfig.viewerUrl + "/app/Widgets/CrossBox/config.json")];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            crossBoxConfig = _a.sent();
                            signalLampLayerUrl = crossBoxConfig.layers.signalLamp;
                            signalLampLayerUrl = signalLampLayerUrl.replace(/{gisServer}/i, ConfigManager_1.default.getInstance().appConfig.map.gisServer);
                            queryTask = new QueryTask({
                                url: signalLampLayerUrl
                            });
                            query = new Query();
                            query.returnGeometry = true;
                            query.outFields = ["*"];
                            query.where = "1=1";
                            return [4 /*yield*/, queryTask.execute(query)];
                        case 3:
                            results = _a.sent();
                            results.features.forEach(function (graphic) { return __awaiter(_this, void 0, void 0, function () {
                                var lampAppClass, symbolHeading, symbol, walkSignalLampSymbol, objectSymbolLayer, symbol, carSignalLampSymbol, objectSymbolLayer;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            lampAppClass = graphic.attributes.LAMPAPPCLASS;
                                            symbolHeading = graphic.attributes.HEADING;
                                            if (!(lampAppClass === "4")) return [3 /*break*/, 2];
                                            symbol = new WebStyleSymbol({
                                                name: "Traffic_Light_3",
                                                styleName: "EsriRealisticSignsandSignalsStyle"
                                            });
                                            return [4 /*yield*/, symbol.fetchSymbol()];
                                        case 1:
                                            walkSignalLampSymbol = _a.sent();
                                            objectSymbolLayer = walkSignalLampSymbol.symbolLayers.getItemAt(0).clone();
                                            // objectSymbolLayer.material = {color: "white"};
                                            objectSymbolLayer.height *= 3;
                                            objectSymbolLayer.width *= 2;
                                            objectSymbolLayer.depth *= 2;
                                            objectSymbolLayer.heading = symbolHeading;
                                            walkSignalLampSymbol.symbolLayers.removeAll();
                                            walkSignalLampSymbol.symbolLayers.add(objectSymbolLayer);
                                            graphic.symbol = walkSignalLampSymbol;
                                            return [3 /*break*/, 4];
                                        case 2:
                                            symbol = new WebStyleSymbol({
                                                name: "Traffic_Light_2",
                                                styleName: "EsriRealisticSignsandSignalsStyle"
                                            });
                                            return [4 /*yield*/, symbol.fetchSymbol()];
                                        case 3:
                                            carSignalLampSymbol = _a.sent();
                                            objectSymbolLayer = carSignalLampSymbol.symbolLayers.getItemAt(0).clone();
                                            // objectSymbolLayer.material = {color: "white"};
                                            objectSymbolLayer.height *= 2;
                                            objectSymbolLayer.width *= 2;
                                            objectSymbolLayer.depth *= 2;
                                            objectSymbolLayer.heading = symbolHeading;
                                            carSignalLampSymbol.symbolLayers.removeAll();
                                            carSignalLampSymbol.symbolLayers.add(objectSymbolLayer);
                                            graphic.symbol = carSignalLampSymbol;
                                            _a.label = 4;
                                        case 4:
                                            this.signalLampLayer.add(graphic);
                                            return [2 /*return*/, graphic];
                                    }
                                });
                            }); });
                            return [2 /*return*/];
                    }
                });
            });
        };
        ShiftStage.prototype.showSignalLampStage = function (stage) {
            var _this = this;
            this.signalLampGraphic.forEach(function (graphic) {
                var lampAppClass = graphic.attributes.LAMPAPPCLASS;
                var greenStage = graphic.attributes.GREENSTAGE;
                var picUrl;
                var picWidth;
                var picHeight;
                switch (lampAppClass) {
                    case "1":
                        //机动车信号灯
                        if (greenStage.indexOf(stage) >= 0) {
                            picUrl = "/app/images/point_green.png";
                        }
                        else {
                            picUrl = "/app/images/point_red.png";
                        }
                        picHeight = picWidth = "72px";
                        break;
                    case "4":
                        //人行横道信号灯
                        if (greenStage.indexOf(stage) >= 0) {
                            picUrl = "/app/images/Man_green.png";
                        }
                        else {
                            picUrl = "/app/images/Man_red.png";
                        }
                        picHeight = picWidth = "36px";
                        break;
                    case "6":
                        //左转机动车信号灯
                        if (greenStage.indexOf(stage) >= 0) {
                            picUrl = "/app/images/TurnLeft_green.png";
                        }
                        else {
                            picUrl = "/app/images/TurnLeft_red.png";
                        }
                        picHeight = picWidth = "72px";
                        break;
                }
                graphic.symbol = new PictureMarkerSymbol({
                    url: _this.appConfig.viewerUrl + picUrl,
                    width: picWidth,
                    height: picHeight
                });
                _this.signalLampLayer.add(graphic);
            });
        };
        return ShiftStage;
    }());
    exports.default = ShiftStage;
});
//# sourceMappingURL=ShiftStage.js.map