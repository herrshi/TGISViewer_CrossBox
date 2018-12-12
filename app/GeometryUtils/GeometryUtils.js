define(["require", "exports", "esri/geometry/geometryEngine", "esri/geometry/Point", "esri/geometry/Polyline"], function (require, exports, geometryEngine, Point, Polyline) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var GeometryUtils = /** @class */ (function () {
        function GeometryUtils() {
        }
        /**
         * 从一条折线的起点开始，取折线上指定长度的一段
         * 指定长度大于折线长度时，返回折线
         * @param line: 要切割的折线
         * @param length: 切割长度
         * @return 切割后的折线
         * */
        GeometryUtils.clipPolylineInLength = function (line, length) {
            var polyline = new Polyline({
                paths: [line]
            });
            var totalLength = geometryEngine.geodesicLength(polyline, this.UNIT);
            console.log(totalLength, length);
            //总长度小于切割长度，返回整条折线
            if (totalLength < length) {
                return line;
            }
            var result = [];
            for (var i = 0; i < line.length - 1; i++) {
                result.push(line[i]);
                var segment = new Polyline({
                    paths: [[line[i], line[i + 1]]]
                });
                var segLength = geometryEngine.geodesicLength(segment, "meters");
                if (segLength > length) {
                    result.push(this.clipSegment(segment, length));
                    return result;
                }
                else {
                    length -= segLength;
                }
            }
        };
        GeometryUtils.clipSegment = function (segment, length) {
            //线段的起点
            var center = new Point({
                x: segment.paths[0][0][0],
                y: segment.paths[0][0][1]
            });
            //从线段起点为原型，切割长度为半径开始画圆
            var bufferPolygon = geometryEngine.geodesicBuffer(center, length, this.UNIT);
            //线段和圆相交部分即切割后的线段
            var interPolyline = geometryEngine.intersect(segment, bufferPolygon);
            //返回相交线段的终点
            return interPolyline.paths[0][1];
        };
        return GeometryUtils;
    }());
    exports.default = GeometryUtils;
});
//# sourceMappingURL=GeometryUtils.js.map