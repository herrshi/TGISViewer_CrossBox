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
define(["require", "exports", "esri/layers/GraphicsLayer", "esri/tasks/QueryTask", "esri/tasks/support/Query", "esri/symbols/PointSymbol3D", "esri/symbols/ObjectSymbol3DLayer", "app/Managers/MapManager", "app/Managers/ConfigManager"], function (require, exports, GraphicsLayer, QueryTask, Query, PointSymbol3D, ObjectSymbol3DLayer, MapManager_1, ConfigManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SignalLamp = /** @class */ (function () {
        function SignalLamp() {
            this.map = MapManager_1.default.getInstance().map;
            this.appConfig = ConfigManager_1.default.getInstance().appConfig;
            this.signalLampLayer = new GraphicsLayer();
            this.map.add(this.signalLampLayer);
        }
        SignalLamp.getInstance = function () {
            if (!this.instance) {
                this.instance = new SignalLamp();
            }
            return this.instance;
        };
        SignalLamp.prototype.showSignalLamps = function () {
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
                                var lampAppClass, symbolHeading, symbol, objectSymbol3DLayer, objectSymbol3DLayer;
                                return __generator(this, function (_a) {
                                    lampAppClass = graphic.attributes.LAMPAPPCLASS;
                                    symbolHeading = graphic.attributes.HEADING;
                                    graphic.attributes.normal = true;
                                    symbol = new PointSymbol3D();
                                    if (lampAppClass === "4") {
                                        objectSymbol3DLayer = new ObjectSymbol3DLayer({
                                            width: 0.7,
                                            height: 10.2,
                                            depth: 1.2,
                                            heading: symbolHeading,
                                            resource: {
                                                href: this.appConfig.viewerUrl +
                                                    "/app/assets/model/Traffic_Light_3.glb"
                                            }
                                        });
                                        symbol.symbolLayers.add(objectSymbol3DLayer);
                                    }
                                    else {
                                        objectSymbol3DLayer = new ObjectSymbol3DLayer({
                                            width: 0.7,
                                            height: 18,
                                            depth: 13.58,
                                            heading: symbolHeading,
                                            material: undefined,
                                            resource: {
                                                href: this.appConfig.viewerUrl +
                                                    "/app/assets/model/Traffic_Light_2.glb"
                                            }
                                        });
                                        symbol.symbolLayers.add(objectSymbol3DLayer);
                                    }
                                    graphic.symbol = symbol;
                                    this.signalLampLayer.add(graphic);
                                    return [2 /*return*/];
                                });
                            }); });
                            return [4 /*yield*/, this.updateSignalLampSymbol()];
                        case 4:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        SignalLamp.prototype.getSignalLampState = function () {
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch(this.appConfig.viewerUrl + "/app/Widgets/CrossBox/RBX_RT_LAMP_XHDZT.json")];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        SignalLamp.prototype.updateSignalLampSymbol = function () {
            return __awaiter(this, void 0, void 0, function () {
                var lampStates;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getSignalLampState()];
                        case 1:
                            lampStates = _a.sent();
                            this.signalLampLayer.graphics.forEach(function (lampGraphic) {
                                //地图上一个机动车灯模型包含多个信号灯
                                //模型id: 设备代码-信号灯编号1|信号灯编号2|, ..., |信号灯编号n
                                //有一个信号灯状态异常就用红色
                                var featureId = lampGraphic.attributes.FEATUREID;
                                var featureIdArray = featureId.split("-");
                                var SBBH = featureIdArray[0];
                                var lampId = featureIdArray[1];
                                var lampIds = lampId.split("|");
                                var normal = true;
                                lampIds.forEach(function (lampId) {
                                    for (var i = 0; i < lampStates.length; i++) {
                                        if (lampStates[i].sbbh === SBBH &&
                                            String(lampStates[i].xhdbh) === lampId &&
                                            (lampStates[i].xhdtxzt != 1 || lampStates[i].xhdgzzt != 1)) {
                                            normal = false;
                                            break;
                                        }
                                    }
                                });
                                //设置红色
                                if (!normal) {
                                }
                            });
                            return [2 /*return*/];
                    }
                });
            });
        };
        return SignalLamp;
    }());
    exports.default = SignalLamp;
});
//# sourceMappingURL=SignalLamp.js.map