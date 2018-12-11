define(["require", "exports", "app/managers/ConfigManager", "esri/Map", "esri/views/MapView"], function (require, exports, ConfigManager_1, EsriMap, MapView) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Map {
        constructor(params) {
            const configManager = ConfigManager_1.ConfigManager.getInstance();
            configManager.loadConfig(params.config).then(appConfig => {
                configManager.appConfig = appConfig;
            });
            const map = new EsriMap({
                basemap: "streets"
            });
            const view = new MapView({
                map: map,
                container: "viewDiv",
                center: [-118.244, 34.052],
                zoom: 12
            });
        }
    }
    exports.Map = Map;
});
//# sourceMappingURL=main.js.map