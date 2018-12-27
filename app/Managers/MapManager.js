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
define(["require", "exports", "esri/Map", "esri/Basemap", "esri/views/SceneView", "esri/layers/TileLayer", "esri/layers/MapImageLayer", "esri/layers/FeatureLayer", "esri/widgets/Home", "app/Widgets/CameraInfo/CameraInfo"], function (require, exports, EsriMap, Basemap, SceneView, TileLayer, MapImageLayer, FeatureLayer, Home, CameraInfo) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MapManager = /** @class */ (function () {
        function MapManager() {
        }
        MapManager.prototype.showMap = function (appConfig, div) {
            return __awaiter(this, void 0, void 0, function () {
                var baseLayers, optLayers, basemap, view;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console.time("Load Map");
                            this.appConfig = appConfig;
                            this.containerDiv = div;
                            baseLayers = appConfig.map.basemaps.map(function (baseLayerConfig) {
                                var layer;
                                switch (baseLayerConfig.type) {
                                    case "tile":
                                        //创建图层的参数中不能含有type
                                        delete baseLayerConfig.type;
                                        baseLayerConfig.url = baseLayerConfig.url.replace(/{gisServer}/i, appConfig.map.gisServer);
                                        layer = new TileLayer(baseLayerConfig);
                                        break;
                                }
                                return layer;
                            });
                            optLayers = appConfig.map.operationallayers.map(function (optLayerConfig) {
                                var layer;
                                optLayerConfig.url = optLayerConfig.url.replace(/{gisServer}/i, appConfig.map.gisServer);
                                switch (optLayerConfig.type) {
                                    case "map-image":
                                        //创建图层的参数中不能含有type
                                        delete optLayerConfig.type;
                                        layer = new MapImageLayer(optLayerConfig);
                                        break;
                                    case "feature":
                                        delete optLayerConfig.type;
                                        layer = new FeatureLayer(optLayerConfig);
                                        break;
                                }
                                return layer;
                            });
                            basemap = new Basemap({
                                baseLayers: baseLayers
                            });
                            this.map = new EsriMap({
                                basemap: basemap,
                                layers: optLayers
                            });
                            view = new SceneView({
                                container: this.containerDiv,
                                map: this.map,
                                viewingMode: "local",
                                camera: this.appConfig.map.camera
                            });
                            return [4 /*yield*/, view.when(function () {
                                    var ui = view.ui;
                                    //UI
                                    ui.remove("attribution");
                                    ui.remove("navigation-toggle");
                                    var homeWidget = new Home({
                                        view: view
                                    });
                                    var cameraInfoWidget = new CameraInfo({
                                        view: view
                                    });
                                    ui.add([
                                        {
                                            component: homeWidget,
                                            position: "top-left",
                                            index: 1
                                        },
                                        {
                                            component: cameraInfoWidget,
                                            position: "top-right",
                                            index: 0
                                        }
                                    ]);
                                    console.timeEnd("Load Map");
                                })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        MapManager.getInstance = function () {
            if (!this.instance) {
                this.instance = new MapManager();
            }
            return this.instance;
        };
        return MapManager;
    }());
    exports.default = MapManager;
});
//# sourceMappingURL=MapManager.js.map