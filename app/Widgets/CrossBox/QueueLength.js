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
define(["require", "exports", "esri/layers/FeatureLayer", "esri/Graphic", "esri/geometry/Polygon", "esri/layers/GraphicsLayer", "app/Managers/MapManager", "app/GeometryUtils/GeometryUtils"], function (require, exports, FeatureLayer, Graphic, Polygon, GraphicsLayer, MapManager_1, GeometryUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var QueueLength = /** @class */ (function () {
        function QueueLength() {
            this.graphicsLayer = new GraphicsLayer();
            var mapManager = MapManager_1.default.getInstance();
            mapManager.map.add(this.graphicsLayer);
        }
        QueueLength.prototype.setQueueLength = function (queueDatas) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console.log(queueDatas);
                            if (!!this.laneLines) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.getLaneLines()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            queueDatas.forEach(function (queueData) { return __awaiter(_this, void 0, void 0, function () {
                                var laneId, queueLength, laneInfo, crossId, laneDir, laneIndex, laneLineIndex1, laneLineIndex2, laneLineId1, laneLineId2, laneLine1, laneLine2, queuePath1, queuePath2, ring, queuePolygon, fillSymbol, queueGraphic;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            laneId = queueData.laneId, queueLength = queueData.queueLength;
                                            laneInfo = laneId.split("-");
                                            crossId = laneInfo[0], laneDir = laneInfo[1], laneIndex = laneInfo[2];
                                            laneLineIndex1 = Number(laneIndex) - 1;
                                            laneLineIndex2 = Number(laneIndex);
                                            laneLineId1 = crossId + "-" + laneDir + "-00" + laneLineIndex1;
                                            laneLineId2 = crossId + "-" + laneDir + "-00" + laneLineIndex2;
                                            laneLine1 = this.getLaneLine(laneLineId1);
                                            laneLine2 = this.getLaneLine(laneLineId2);
                                            return [4 /*yield*/, GeometryUtils_1.default.clipPolylineInLength(laneLine1.paths[0], queueLength)];
                                        case 1:
                                            queuePath1 = _a.sent();
                                            return [4 /*yield*/, GeometryUtils_1.default.clipPolylineInLength(laneLine2.paths[0], queueLength)];
                                        case 2:
                                            queuePath2 = _a.sent();
                                            ring = queuePath1.concat(queuePath2.reverse());
                                            ring.push(queuePath1[0]);
                                            queuePolygon = new Polygon({
                                                rings: [ring]
                                            });
                                            fillSymbol = {
                                                type: "simple-fill",
                                                color: queueLength <= 10 ? [0, 255, 0, 0.8] : [255, 0, 0, 0.8],
                                                outline: {
                                                    color: [255, 255, 255],
                                                    width: 1
                                                }
                                            };
                                            queueGraphic = new Graphic({
                                                geometry: queuePolygon,
                                                symbol: fillSymbol
                                            });
                                            this.graphicsLayer.add(queueGraphic);
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**从车道服务中查询出所有车道的polyline*/
        QueueLength.prototype.getLaneLines = function () {
            return __awaiter(this, void 0, void 0, function () {
                var response, crossBoxConfig, laneLayerUrl, laneLayer, query, laneFeatureSet;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch("app/Widgets/CrossBox/config.json")];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            crossBoxConfig = _a.sent();
                            laneLayerUrl = crossBoxConfig.layers.lane;
                            laneLayer = new FeatureLayer({
                                url: laneLayerUrl
                            });
                            query = laneLayer.createQuery();
                            return [4 /*yield*/, laneLayer.queryFeatures(query)];
                        case 3:
                            laneFeatureSet = _a.sent();
                            this.laneLines = laneFeatureSet.features.map(function (laneGraphic) {
                                var id = laneGraphic.attributes.FEATUREID;
                                var line = laneGraphic.geometry;
                                return { id: id, line: line };
                            });
                            return [2 /*return*/];
                    }
                });
            });
        };
        QueueLength.prototype.getLaneLine = function (id) {
            var line;
            this.laneLines.forEach(function (laneLineObj) {
                if (laneLineObj.id === id) {
                    line = laneLineObj.line;
                }
            });
            return line;
        };
        QueueLength.getInstance = function () {
            if (!this.instance) {
                this.instance = new QueueLength();
            }
            return this.instance;
        };
        return QueueLength;
    }());
    exports.default = QueueLength;
});
//# sourceMappingURL=QueueLength.js.map