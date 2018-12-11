define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ConfigManager = /** @class */ (function () {
        function ConfigManager(configFile) {
        }
        ConfigManager.getInstance = function (configFile) {
            if (!this.instance) {
                this.instance = new ConfigManager(configFile);
            }
            return this.instance;
        };
        return ConfigManager;
    }());
    exports.ConfigManager = ConfigManager;
});
//# sourceMappingURL=ConfigManager.js.map