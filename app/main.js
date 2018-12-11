define(["require", "exports", "managers/ConfigManager"], function (require, exports, ConfigManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Map = /** @class */ (function () {
        function Map(divName, projectConfig) {
            var configManager = ConfigManager_1.ConfigManager.getInstance(projectConfig);
        }
        return Map;
    }());
    exports.Map = Map;
});
//# sourceMappingURL=main.js.map