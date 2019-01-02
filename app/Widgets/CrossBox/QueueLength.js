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
define(["require", "exports", "esri/Graphic", "esri/geometry/geometryEngine", "esri/geometry/Point", "esri/geometry/Polygon", "esri/geometry/Polyline", "esri/layers/GraphicsLayer", "esri/layers/FeatureLayer", "esri/geometry/support/webMercatorUtils", "esri/symbols/PointSymbol3D", "esri/symbols/ObjectSymbol3DLayer", "app/Managers/MapManager", "app/GeometryUtils/GeometryUtils", "app/Managers/ConfigManager"], function (require, exports, Graphic, geometryEngine, Point, Polygon, Polyline, GraphicsLayer, FeatureLayer, webMercatorUtils, PointSymbol3D, ObjectSymbol3DLayer, MapManager_1, GeometryUtils_1, ConfigManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var QueueLength = /** @class */ (function () {
        function QueueLength() {
            //车道中心线
            this.laneCenterLines = [];
            this.map = MapManager_1.default.getInstance().map;
            this.appConfig = ConfigManager_1.default.getInstance().appConfig;
            this.graphicsLayer = new GraphicsLayer();
            this.map.add(this.graphicsLayer);
        }
        QueueLength.getInstance = function () {
            if (!this.instance) {
                this.instance = new QueueLength();
            }
            return this.instance;
        };
        QueueLength.prototype.setQueueLength = function (queueDatas) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!!this.laneLines) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.queryAllLaneLines()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            this.graphicsLayer.removeAll();
                            queueDatas.forEach(function (queueData) { return __awaiter(_this, void 0, void 0, function () {
                                var laneId, queueLength, queuePolygon;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            laneId = queueData.laneId, queueLength = queueData.queueLength;
                                            return [4 /*yield*/, this.getQueuePolygon(laneId, queueLength)];
                                        case 1:
                                            queuePolygon = _a.sent();
                                            if (!queuePolygon) return [3 /*break*/, 3];
                                            // await this.addQueueGraphic(queuePolygon, queueData);
                                            return [4 /*yield*/, this.placeRandomVehicles(queueData)];
                                        case 2:
                                            // await this.addQueueGraphic(queuePolygon, queueData);
                                            _a.sent();
                                            _a.label = 3;
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); });
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**将polygon符号化以后加到地图中*/
        QueueLength.prototype.addQueueGraphic = function (polygon, queueData) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, fillColor, edgeColor, queueSymbol, queueGraphic;
                return __generator(this, function (_b) {
                    _a = QueueLength.getColor(queueData.queueLength), fillColor = _a.fillColor, edgeColor = _a.edgeColor;
                    queueSymbol = {
                        type: "polygon-3d",
                        symbolLayers: [
                            {
                                type: "fill",
                                material: { color: fillColor },
                                outline: { color: edgeColor }
                            }
                        ]
                    };
                    queueGraphic = new Graphic({
                        geometry: polygon,
                        symbol: queueSymbol,
                        attributes: queueData
                    });
                    this.graphicsLayer.add(queueGraphic);
                    return [2 /*return*/];
                });
            });
        };
        /**
         * 根据车道的两条边线，生成能贴合车道并能反映排队长度的面
         * */
        QueueLength.prototype.getQueuePolygon = function (laneId, queueLength) {
            return __awaiter(this, void 0, void 0, function () {
                var laneInfo, crossId, laneDir, laneIndex, laneLineIndex1, laneLineIndex2, laneLineId1, laneLineId2, laneLine1, laneLine2, queuePath1, queuePath2, ring;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            laneInfo = laneId.split("-");
                            crossId = laneInfo[0], laneDir = laneInfo[1], laneIndex = laneInfo[2];
                            laneLineIndex1 = Number(laneIndex) - 1;
                            laneLineIndex2 = Number(laneIndex);
                            laneLineId1 = crossId + "-" + laneDir + "-00" + laneLineIndex1;
                            laneLineId2 = crossId + "-" + laneDir + "-00" + laneLineIndex2;
                            laneLine1 = this.getLaneLine(laneLineId1);
                            laneLine2 = this.getLaneLine(laneLineId2);
                            if (!(laneLine1 && laneLine2)) return [3 /*break*/, 4];
                            return [4 /*yield*/, GeometryUtils_1.default.clipPolylineInLength(laneLine1.paths[0], queueLength)];
                        case 1:
                            queuePath1 = _a.sent();
                            return [4 /*yield*/, GeometryUtils_1.default.clipPolylineInLength(laneLine2.paths[0], queueLength)];
                        case 2:
                            queuePath2 = _a.sent();
                            return [4 /*yield*/, this.extractCentreLine(laneId, laneLine1, laneLine2)];
                        case 3:
                            _a.sent();
                            ring = queuePath1.concat(queuePath2.reverse());
                            //ring的终点必须和起点重合
                            ring.push(queuePath1[0]);
                            return [2 /*return*/, new Polygon({
                                    rings: [ring]
                                })];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * 按照排队长度，在车道上放置随机车辆
         * */
        QueueLength.prototype.placeRandomVehicles = function (queueData) {
            return __awaiter(this, void 0, void 0, function () {
                var line, i, frontVehicleDistance, vehicleSymbol, vehicleLength, path, _a, x, y, vehiclePoint, vehicleGraphic;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            for (i = 0; i < this.laneCenterLines.length; i++) {
                                if (this.laneCenterLines[i].id === queueData.laneId) {
                                    line = this.laneCenterLines[i].line;
                                    break;
                                }
                            }
                            frontVehicleDistance = 0;
                            _b.label = 1;
                        case 1:
                            if (!(frontVehicleDistance < queueData.queueLength)) return [3 /*break*/, 3];
                            vehicleSymbol = this.getRandomVehicleSymbol();
                            vehicleLength = vehicleSymbol.symbolLayers.getItemAt(0).depth;
                            return [4 /*yield*/, GeometryUtils_1.default.clipPolylineInLength(line.paths[0], frontVehicleDistance + vehicleLength / 2 + 1)];
                        case 2:
                            path = _b.sent();
                            _a = path[path.length - 1], x = _a[0], y = _a[1];
                            vehiclePoint = new Point({
                                x: x,
                                y: y
                            });
                            QueueLength.setVehicleSymbolHeading(vehicleSymbol, line.getPoint(0, 0), vehiclePoint);
                            vehicleGraphic = new Graphic({
                                geometry: vehiclePoint,
                                symbol: vehicleSymbol
                            });
                            this.graphicsLayer.add(vehicleGraphic);
                            frontVehicleDistance += vehicleLength + 1;
                            return [3 /*break*/, 1];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        //获取两条车道线的中线
        QueueLength.prototype.extractCentreLine = function (id, laneLine1, laneLine2) {
            var lineObjs = this.laneCenterLines.filter(function (lineObj) {
                return lineObj.id === id;
            });
            if (lineObjs.length > 0) {
                return lineObjs[0].line;
            }
            //将两条车道线的起点连线，以计算车道宽度
            var path = [
                laneLine1.paths[0][0],
                laneLine2.paths[0][0]
            ];
            var line = new Polyline({
                paths: [path]
            });
            //offset需要geometry和offsetUnit单位一致，所以转到墨卡托投影
            var projectedLine = webMercatorUtils.geographicToWebMercator(laneLine1);
            var distance = geometryEngine.geodesicLength(line, "meters");
            var offsetLength = distance / 2;
            var offsetLine = geometryEngine.offset(projectedLine, -offsetLength, "meters", "miter");
            var geographicLine = webMercatorUtils.webMercatorToGeographic(offsetLine);
            this.laneCenterLines.push({ id: id, line: geographicLine });
            return offsetLine;
        };
        /**根据排队长度生成填充颜色*/
        QueueLength.getColor = function (queueLength) {
            return queueLength <= 10
                ? { fillColor: [100, 210, 122, 0.4], edgeColor: [37, 129, 55, 1] }
                : queueLength <= 20
                    ? { fillColor: [250, 207, 51, 0.6], edgeColor: [204, 159, 4, 1] }
                    : { fillColor: [172, 0, 0, 0.8], edgeColor: [91, 0, 0, 1] };
        };
        /**从车道服务中查询出所有车道的polyline*/
        QueueLength.prototype.queryAllLaneLines = function () {
            return __awaiter(this, void 0, void 0, function () {
                var response, _a, laneLayerUrl, laneLayer, query, laneFeatureSet;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, fetch(this.appConfig.viewerUrl + "/app/Widgets/CrossBox/config.json")];
                        case 1:
                            response = _b.sent();
                            _a = this;
                            return [4 /*yield*/, response.json()];
                        case 2:
                            _a.crossBoxConfig = _b.sent();
                            laneLayerUrl = this.crossBoxConfig.layers.lane;
                            // const configManager: ConfigManager = ConfigManager.getInstance();
                            laneLayerUrl = laneLayerUrl.replace(/{gisServer}/i, this.appConfig.map.gisServer);
                            laneLayer = new FeatureLayer({
                                url: laneLayerUrl
                            });
                            query = laneLayer.createQuery();
                            return [4 /*yield*/, laneLayer.queryFeatures(query)];
                        case 3:
                            laneFeatureSet = _b.sent();
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
        //根据id获取车道线
        QueueLength.prototype.getLaneLine = function (id) {
            var line;
            this.laneLines.forEach(function (laneLineObj) {
                if (laneLineObj.id === id) {
                    line = laneLineObj.line;
                }
            });
            return line;
        };
        QueueLength.prototype.getRandomVehicleSymbol = function () {
            // const vehicleSymbols: { name: string; styleName: string }[] = this
            //   .crossBoxConfig.vehicleSymbols;
            // const random: number = Math.round(
            //   Math.random() * (vehicleSymbols.length - 1)
            // );
            // const originalSymbol: WebStyleSymbol = new WebStyleSymbol(
            //   vehicleSymbols[random]
            // );
            // return await originalSymbol.fetchSymbol();
            var vehicleSymbols = this.crossBoxConfig.vehicleSymbols;
            var random = Math.round(Math.random() * (vehicleSymbols.length - 1));
            console.log(random, vehicleSymbols[random]);
            var objectSymbol3DLayer = new ObjectSymbol3DLayer({
                width: vehicleSymbols[random].symbolLayers[0].width,
                height: vehicleSymbols[random].symbolLayers[0].height,
                depth: vehicleSymbols[random].symbolLayers[0].depth,
                anchor: vehicleSymbols[random].symbolLayers[0].anchor,
                resource: {
                    href: this.appConfig.viewerUrl +
                        "/" +
                        vehicleSymbols[random].symbolLayers[0].resource.href
                }
            });
            var symbol = new PointSymbol3D();
            symbol.symbolLayers.add(objectSymbol3DLayer);
            return symbol;
        };
        //设置车辆模型的车头朝向
        QueueLength.setVehicleSymbolHeading = function (symbol, pt1, pt2) {
            pt1 = webMercatorUtils.geographicToWebMercator(pt1);
            pt2 = webMercatorUtils.geographicToWebMercator(pt2);
            var objectSymbolLayer = symbol.symbolLayers.getItemAt(0).clone();
            objectSymbolLayer.heading = QueueLength.calculateAngle(pt1, pt2);
            symbol.symbolLayers.removeAll();
            symbol.symbolLayers.add(objectSymbolLayer);
        };
        QueueLength.calculateAngle = function (pt1, pt2) {
            var radian = Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x);
            radian = radian - Math.PI / 2;
            var degrees;
            if (radian > 0) {
                degrees = 360 - (radian * 360) / (2 * Math.PI);
            }
            else {
                degrees = 360 - ((2 * Math.PI + radian) * 360) / (2 * Math.PI);
            }
            //车道线的方向是从停车线开始指向后方，和行车方向相反，需要偏转180度
            degrees += 180;
            if (degrees > 360) {
                degrees -= 360;
            }
            return degrees;
        };
        return QueueLength;
    }());
    exports.default = QueueLength;
});
//# sourceMappingURL=QueueLength.js.map