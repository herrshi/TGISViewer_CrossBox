define(["require", "exports", "app/Widgets/CrossBox/QueueLength"], function (require, exports, QueueLength_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CrossBox = /** @class */ (function () {
        function CrossBox() {
            this.queueLength = QueueLength_1.default.getInstance();
        }
        CrossBox.prototype.setQueueLength = function (queueDatas) {
            var queueLength = QueueLength_1.default.getInstance();
            queueLength.setQueueLength(queueDatas);
        };
        CrossBox.getInstance = function () {
            if (!this.instance) {
                this.instance = new CrossBox();
            }
            return this.instance;
        };
        return CrossBox;
    }());
    exports.default = CrossBox;
});
//# sourceMappingURL=CrossBox.js.map