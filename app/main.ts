/// <reference path="globals.d.ts"/>

import ConfigManager from "app/Managers/ConfigManager";
import MapManager from "app/Managers/MapManager";
import GeometryUtils from "app/GeometryUtils/GeometryUtils";
import CrossBox from "app/Widgets/CrossBox/CrossBox";

// interface QueueData {
//   laneId: string,
//   queueLength: number
// }

class Map {
  private params: any;

  constructor(params: any) {
    this.params = params;
  }

  public async createMap() {
    const configManager: ConfigManager = ConfigManager.getInstance();
    await configManager.loadConfig(this.params.config);
    const mapManager: MapManager = MapManager.getInstance();
    return await mapManager.showMap(configManager.appConfig, this.params.container);
  }

  /**
   * 设置路口排队长度
   * @param queueDatas
   * */
  public async setCrossQueueLength(queueDatas: Array<QueueData>) {
    const crossBox: CrossBox = CrossBox.getInstance();
    crossBox.setQueueLength(queueDatas);
  }

  public async clipLineInLength(line: Array<Array<number>>, length: number) {
    return await GeometryUtils.clipPolylineInLength(line, length);
  }
}

export { Map };
