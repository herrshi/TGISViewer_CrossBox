import EsriMap = require("esri/Map");
import Basemap = require("esri/Basemap");
import SceneView = require("esri/views/SceneView");
import Layer = require("esri/layers/Layer");
import TileLayer = require("esri/layers/TileLayer");
import MapImageLayer = require("esri/layers/MapImageLayer");

import CameraInfo = require("app/widgets/CameraInfo");

export class MapManager {
  private static instance: MapManager;

  private appConfig: any;
  private containerDiv: string;

  public async showMap(appConfig: any, div: string) {
    console.time("Load Map");

    this.appConfig = appConfig;
    this.containerDiv = div;
    //读取底图
    const baseLayers: Array<Layer> = appConfig.map.basemaps.map(
      (baseLayerConfig: any) => {
        let layer: Layer;
        switch (baseLayerConfig.type) {
          case "tile":
            //Constructors参数中不能含有type
            delete baseLayerConfig.type;
            layer = new TileLayer(baseLayerConfig);
            break;
        }
        return layer;
      }
    );

    //读取业务图层
    const optLayers: Array<Layer> = appConfig.map.operationallayers.map(
      (optLayerConfig: any) => {
        let layer: Layer;
        switch (optLayerConfig.type) {
          case "map-image":
            delete optLayerConfig.type;
            layer = new MapImageLayer(optLayerConfig);
            break;
        }
        return layer;
      }
    );

    const basemap = new Basemap({
      baseLayers: baseLayers
    });
    const map = new EsriMap({
      basemap: basemap,
      layers: optLayers
    });
    const view = new SceneView({
      container: this.containerDiv,
      map: map,
      viewingMode: "local",
      camera: this.appConfig.map.camera
    });

    return await view.when(function() {
      view.ui.remove("attribution");

      const cameraInfo: CameraInfo = new CameraInfo({
        view: view
      });
      view.ui.add(cameraInfo, "top-right");

      console.timeEnd("Load Map");
    });
  }

  static getInstance(): MapManager {
    if (!this.instance) {
      this.instance = new MapManager();
    }
    return this.instance;
  }
}
