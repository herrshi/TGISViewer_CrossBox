import geometryEngineAsync = require("esri/geometry/geometryEngineAsync");
import geometryEngine = require("esri/geometry/geometryEngine");
import Point = require("esri/geometry/Point");
import Polyline = require("esri/geometry/Polyline");
import Polygon = require("esri/geometry/Polygon");

export default class GeometryUtils {
  private static UNIT: "meters";

  /**
   * 从一条折线的起点开始，取折线上指定长度的一段
   * 指定长度大于折线长度时，返回折线
   * @param line: 要切割的折线
   * @param length: 切割长度
   * @return Promise<切割后的折线>
   * */
  public static async clipPolylineInLength(
    line: Array<Array<number>>,
    length: number
  ): Promise<Array<Array<number>>> {
    return new Promise<Array<Array<number>>>(async resolve => {
      //先计算总长度
      //若总长度小于切割长度，则返回整条折线
      let polyline: Polyline = new Polyline({
        paths: [line]
      });
      const totalLength: number = await geometryEngineAsync.geodesicLength(
        polyline,
        this.UNIT
      );
      if (totalLength < length) {
        resolve(line);
      }

      let result: Array<Array<number>> = [];
      for (let i = 0; i < line.length - 1; i++) {
        result.push(line[i]);

        const segment: Polyline = new Polyline({
          paths: [[line[i], line[i + 1]]]
        });
        const segLength: number = await geometryEngineAsync.geodesicLength(
          segment,
          this.UNIT
        );

        if (segLength > length) {
          result.push(this.clipSegment(segment, length));
          resolve(result);
          break;
        } else {
          length = length - segLength;
        }
      }
    });
  }

  private static clipSegment(segment: Polyline, length: number): Array<number> {
    //线段的起点
    const center: Point = new Point({
      x: segment.paths[0][0][0],
      y: segment.paths[0][0][1]
    });
    //从线段起点为圆心，切割长度为半径开始画圆
    const bufferPolygon: Polygon = geometryEngine.geodesicBuffer(
      center,
      length,
      this.UNIT
    ) as Polygon;
    //线段和圆相交部分即切割后的线段
    const interPolyline: Polyline = geometryEngine.intersect(
      segment,
      bufferPolygon
    ) as Polyline;
    //返回相交线段的终点
    return interPolyline.paths[0][1];
  }
}
