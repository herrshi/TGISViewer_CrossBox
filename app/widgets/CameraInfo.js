/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/core/watchUtils", "esri/widgets/support/widget", "esri/geometry/Point", "esri/geometry/support/webMercatorUtils"], function (require, exports, __extends, __decorate, decorators_1, Widget, watchUtils, widget_1, Point, webMercatorUtils) {
    "use strict";
    var CSS = {
        base: "camera-info-tool"
    };
    var CameraInfo = /** @class */ (function (_super) {
        __extends(CameraInfo, _super);
        function CameraInfo(options) {
            var _this = _super.call(this) || this;
            _this._onViewChange = _this._onViewChange.bind(_this);
            return _this;
        }
        CameraInfo.prototype.postInitialize = function () {
            var _this = this;
            watchUtils.init(this, "view.interacting, view.camera", function () {
                return _this._onViewChange();
            });
        };
        //public method
        CameraInfo.prototype.render = function () {
            var _a = this.state, heading = _a.heading, tilt = _a.tilt, position = _a.position;
            var styles = {
                textShadow: this.state.interacting
                    ? "-1px 0 red, 0 1px red, 1px 0 red, 0 -1px red"
                    : ""
            };
            if (this.view.spatialReference.isWebMercator) {
                position = new Point(webMercatorUtils.webMercatorToGeographic(position));
            }
            return (widget_1.tsx("div", { bind: this, class: CSS.base, style: styles },
                widget_1.tsx("p", null,
                    "heading: ",
                    Number(heading).toFixed(3)),
                widget_1.tsx("p", null,
                    "tilt: ",
                    Number(tilt).toFixed(3)),
                widget_1.tsx("p", null,
                    "x: ",
                    Number(position.x).toFixed(6)),
                widget_1.tsx("p", null,
                    "y: ",
                    Number(position.y).toFixed(6)),
                widget_1.tsx("p", null,
                    "z: ",
                    Number(position.z).toFixed(6))));
        };
        //private method
        CameraInfo.prototype._onViewChange = function () {
            var _a = this.view, interacting = _a.interacting, camera = _a.camera;
            this.state = {
                heading: camera.heading,
                tilt: camera.tilt,
                position: camera.position,
                interacting: interacting
            };
        };
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], CameraInfo.prototype, "view", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], CameraInfo.prototype, "state", void 0);
        CameraInfo = __decorate([
            decorators_1.subclass("esri.widgets.CameraInfo")
        ], CameraInfo);
        return CameraInfo;
    }(decorators_1.declared(Widget)));
    return CameraInfo;
});
//# sourceMappingURL=CameraInfo.js.map