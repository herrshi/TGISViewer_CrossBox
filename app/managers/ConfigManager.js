var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ConfigManager {
        constructor() {
        }
        loadConfig(configFile) {
            return __awaiter(this, void 0, void 0, function* () {
                this.configFile = configFile;
                const response = yield fetch(this.configFile);
                return yield response.json();
            });
        }
        static getInstance() {
            if (!this.instance) {
                this.instance = new ConfigManager();
            }
            return this.instance;
        }
    }
    exports.ConfigManager = ConfigManager;
});
//# sourceMappingURL=ConfigManager.js.map